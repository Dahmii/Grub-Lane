const sqlite3 = require("sqlite3").verbose();
const databasePath = process.env.DATABASE_PATH;
const express = require("express");

function logOperation(adminId, activity) {
    let db = new sqlite3.Database(databasePath);
    let sql = `INSERT INTO ActivityLog (admin_id, activity) VALUES (?, ?)`;

    db.run(sql, [adminId, activity], function (err) {
        if (err) {
            console.error("Error logging operation:", err.message);
        }
    });

    db.close();
}

function operationLogger(activityDescription) {
    return (req, res, next) => {
        const adminId = req.adminId; 
        if (adminId) {
            logOperation(adminId, activityDescription);
        }
        next();
    };
}

module.exports = operationLogger;
