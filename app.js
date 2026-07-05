const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.post("/vote", async (req, res) => {

    const option = req.body.option;

    if(option !== "cats" && option !== "dogs"){
        return res.status(400).json({
            error:"Invalid option"
        });
    }

    await pool.query(
        "INSERT INTO votes(option) VALUES($1)",
        [option]
    );

    res.json({
        message:"Vote recorded"
    });

});

app.get("/results", async(req,res)=>{

    const result = await pool.query(`
        SELECT option, COUNT(*) AS votes
        FROM votes
        GROUP BY option
    `);

    let response = {
        cats:0,
        dogs:0
    };

    result.rows.forEach(r=>{
        response[r.option]=parseInt(r.votes);
    });

    res.json(response);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});