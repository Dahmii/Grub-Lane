import os
import json
import smtplib
import threading
import redis
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

redis_client = redis.StrictRedis(host='localhost', port=6379)

SMTP_SERVER = os.getenv('SMTP_SERVER')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

RESERVATION_QUEUE = os.getenv('RESERVATION_QUEUE')
PAYMENT_QUEUE = os.getenv('PAYMENT_QUEUE')

ADMIN_EMAIL = "grublane@yahoo.com"  # Admin email address for notifications
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates')

QUEUE_TEMPLATE_MAP = {
    RESERVATION_QUEUE: 'reservation_template.html',
    PAYMENT_QUEUE: 'payment_template.html'
}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_template(template_name):
    template_path = os.path.join(TEMPLATE_DIR, template_name)
    try:
        with open(template_path, 'r', encoding='utf-8') as template_file:
            return template_file.read()
    except FileNotFoundError:
        logging.error(f"Template {template_name} not found in {TEMPLATE_DIR}")
        return None

def render_template(template, context):
    for key, value in context.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))
    return template

def send_email(recipient_email, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        logging.info(f"Email sent to {recipient_email}")

    except Exception as e:
        logging.error(f"Failed to send email to {recipient_email}: {e}")

def notify_admin(action_type, context):
    subject = f"New {action_type} Notification"
    body = render_template(load_template('admin_notification_template.html'), context)
    send_email(ADMIN_EMAIL, subject, body)

def email_worker(queue_name):
    logging.info(f"Listening for messages on {queue_name}...")
    template_name = QUEUE_TEMPLATE_MAP.get(queue_name)
    if not template_name:
        logging.error(f"No template mapped for queue: {queue_name}")
        return

    template = load_template(template_name)
    if not template:
        return

    while True:
        task = redis_client.blpop(queue_name)
        if task:
            _, task_data = task
            task_data = json.loads(task_data)

            recipient_email = task_data['email']
            context = {
                'recipient_name': task_data['name'],
                'reservation_date': task_data['date_time'].split()[0],  # Extract date part
                'reservation_time': task_data['date_time'].split()[1],  # Extract time part
                'guest_count': task_data['number_of_guests']
            }

            subject = f"{queue_name.capitalize()} Confirmation"
            body = render_template(template, context)

            send_email(recipient_email, subject, body)

            # Notify admin after sending the email
            notify_admin(queue_name.capitalize(), context)

def add_email_to_redis_queue(queue_name, recipient_email, name, date, time, number_of_guests):
    task_data = {
        'email': recipient_email,
        'name': name,
        'date_time': f"{date} {time}:00",  # Combine date and time
        'number_of_guests': number_of_guests
    }
    redis_client.rpush(queue_name, json.dumps(task_data))

def start_workers():
    queues = [RESERVATION_QUEUE, PAYMENT_QUEUE]
    for queue_name in queues:
        worker_thread = threading.Thread(target=email_worker, args=(queue_name,))
        worker_thread.daemon = True
        worker_thread.start()

if __name__ == "__main__":
    start_workers()
    try:
        while True:
            pass
    except KeyboardInterrupt:
        logging.info("Shutting down workers.")
