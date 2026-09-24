import express from 'express';
import cors from 'cors';
import { db } from './db.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';


const PORT = 5000;
const app = express();
const SECRET = process.env.JWT_SECRET;


app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true
    }
));
app.use(express.json());
app.use(cookieParser());


app.post('/api1/signup', async (req, res) => {
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

app.post('/api1/login', async (req, res) => {
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
            iat: (Date.now() / 1000),
            exp: (Date.now() / 1000) + (60 * 60 * 24)


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

app.get('/api1/me', (req, res) => {
    const token = req.cookies?.Token;
    if (!token) {
        res.status(401).send({ status: "error", message: "Unauthorized" });
        return;
    };

    jwt.verify(token, SECRET, (err, DecodedData) => {
        if (err) {
            res.status(401).send({ status: "error", message: "Invalid Token" });
            return;
        }


        const nowDate = (new Date() / 1000);
        if (DecodedData.exp < nowDate) {
            res.cookie('Token', '', {
                maxAge: 1,
                httpOnly: true,
                secure: true
            })
            res.status(401).send({ status: "error", message: "Token expired" });
            return;
        }

        let Data = DecodedData;
        delete Data.iat;
        delete Data.exp;

        res.status(200).send({ status: "succes", user: Data })

    });


});

app.post('/api1/logout', (req, res) => {

    res.clearCookie('Token', {
        httpOnly: true,
        secure: true
    });

    res.status(200).send({ status: "succes", message: "User Logout Successfully" });
});



const __dirname = path.resolve();
const __frontend = path.join(__dirname, './ecommerc-web/build');
app.use('/', express.static(__frontend));
app.use("/*splat", express.static(__frontend));


app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
});