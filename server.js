import express from 'express';
import cors from 'cors';
import { db } from './db.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';


const PORT = 5000;
const app = express();
const SECRET = process.env.JWT_SECRET;


app.use(cors());
app.use(express.json());

// app.get('/', async (req, res) => {

//     try {

//         const dbData = await db.query(`SELECT * FROM users`)
//         res.status(200).send({ status: "success", message: "successfully get" })

//     } catch (error) {
//         console.log(error)
//         res.status(500).send({ status: "error", message: "Internal server error" })
//     }

// });



app.post('/signup', async (req, res) => {
    const reqBody = req.body;

    if (!reqBody.full_name || !reqBody.email || !reqBody.password_hash) {
        res.status(400).send({ status: "error", message: "Required parameter missing" });
        return;
    }
    try {
        const salt = bcrypt.genSaltSync(12);
        const hash = bcrypt.hashSync(reqBody.password_hash, salt);
        const dbquery = reqBody.isSeller ?
            `INSERT INTO users (full_name, email, password_hash, phone_num, role) VALUES ($1, $2 ,$3, $4, $5)` :
            `INSERT INTO users (full_name, email, password_hash, phone_num)  VALUES ($1, $2 ,$3, $4)`;

        const dbValuse = reqBody.isSeller ?
            [reqBody.full_name, reqBody.email, hash, reqBody.phone_num || "", 'seller'] :
            [reqBody.full_name, reqBody.email, hash, reqBody.phone_num || ""];

        const dbResponse = await db.query(dbquery, dbValuse)

        res.status(201).send({ status: "success", message: "User successfully created" })

    } catch (err) {
        console.log(err);
        if (err.code == '23505') {
            res.status(400).send({ status: "error", message: "Email already exist" })
            return;
        }
        res.status(500).send({ status: "error", message: "Internal server error" });
    }

});



app.post('/login', async (req, res) => {
    const reqBody = req.body;

    if (!reqBody.email || !reqBody.password_hash) {
        res.status(400).send({ status: "error", message: "Required parameter missing" });
        return;
    };

    try {
        const users = await db.query(`SELECT * FROM users WHERE email = $1`, [reqBody.email]);
        const currentUser = users.rows[0];

        if (!currentUser) {
            res.status(404).send({ status: "error", message: "User not found" });
            return;
        };

        const password = await bcrypt.compare(reqBody.password_hash, currentUser.password_hash); // true mile ga

        if (!password) {
            res.status(401).send({ status: "error", message: "Password did not match" });
            return;
        }
        delete currentUser.password_hash;


        const userToken = jwt.sign({
            ...currentUser,
            iat: Date.now() / 10000,
            exp: (Date.now / 1000) + (60 * 60 * 24)


        }, SECRET);
        // console.log("userToken", userToken);

        res.cookie('Token', userToken, {
            maxAge: 86400000,
            httpOnly: true,
            secure: true
        })

        res.status(200).send({ status: "success", user: currentUser });

    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "error", message: "Internal server error" });
    }

});



app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`)
})