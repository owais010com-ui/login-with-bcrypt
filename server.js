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

        const dbquery = `INSERT INTO users (full_name, email, password_hash, phone_num, role) VALUES ($1, $2, $3, $4, $5)`;
        const dbValues = [
            reqBody.full_name,
            reqBody.email,
            hash,
            reqBody.phone_num || "",
            reqBody.role || "buyer"
        ];

        const dbResponse = await db.query(dbquery, dbValues);

        res.status(201).send({ status: "success", message: "User successfully created" });

    } catch (err) {
        console.log(err);
        if (err.code == '23505') {
            res.status(400).send({ status: "error", message: "Email already exist" });
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


//// Secure APIS ////

// CREATE TABLE IF NOT EXISTS categories(
// id SERIEAL PRIMARY KEY ,
// name VARCHAR(255) NOT NULL UNIQUE,
// description TEXT ,
// create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// )


// CREATE TABLE IF NOT EXISTS products (

// id SERIEAL PRIMARY KEY,

// category_id INT NOT NULL,

// name VARCHAR(255) NOT NULL,
// description TEXT,
// images  text[],
// price DECIMAL(10, 2) NOT NULL,
// stock INT DEFAULT 0,
// created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

// FOREIGN KEY(category_id),
// REFERENCE categories(id),
// ON DELETE RESTRICT

// )


app.use('/api1/*splat', (req, res, next) => {
    const token = req.cookies?.Token;
    if (!token) {
        res.status(401).send({ status: "error", message: "Unauthorized" });
        return;
    };

    jwt.verify(token, SECRET, (err, DecodedData) => {
        if (!err) {
            const nowDate = (new Date() / 1000);
            if (DecodedData.exp < nowDate) {
                res.cookie('Token', '', {
                    maxAge: 1,
                    httpOnly: true,
                    secure: true
                })
                res.status(401).send({ status: "error", message: "Token expired" });
            } else {
                let Data = DecodedData;
                delete Data.iat;
                delete Data.exp;
                req.user = Data;

                next();

            }


        } else {
            res.status(401).send({ status: "error", message: "Invalid Token" });

        }
    });
});


app.get('/api1/me', (req, res) => {
    res.status(200).send({ status: "success", user: req.user })
});


app.get("/api1/categories", async (req, res) => {
    try {
        const categories = await db.query("SELECT * FROM categories");
        res.send({ status: "success", categories: categories.rows })
    } catch (error) {
        res.status(500).send({ status: "error", message: "Internal Server Error" })
    }
})

app.get("/api1/products", async (req, res) => {

    const pageNum = req.query.page || 1;

    const page = (pageNum - 1) * 10
    try {
        const products = await db.query(`
            SELECT
                p.id,
                p.description,
                p.name,
                p.price,
                p.stock,
                p.images,
                c.name AS category_name,
                c.description AS category_description
            FROM products p
            JOIN categories c ON p.category_id = c.id LIMIT 10 OFFSET $1
            `, [page])
        res.send({ status: "success", products: products.rows })
    } catch (error) {
        console.log("Err", error);
        res.status(500).send({ status: "error", message: "Internal Server Error" })
    }
})

app.post('/api1/logout', (req, res) => {

    res.clearCookie('Token', {
        httpOnly: true,
        secure: true
    });

    res.status(200).send({ status: "succes", message: "User Logout Successfully" });
});

/////// UNDER ADMIN 

app.use('/api1/*splat', (req, res, next) => {
    const admin = req.user.role;
    if (admin != 'admin') {
        res.status(401).send({ status: "ërror", message: "This is only use for admin" })
    } else {
        next();
    }

});

app.get('/api1/users', async (req, res) => {
    try {
        const dbResponse = await db.query(`SELECT id, full_name, email, role, phone_num, is_active, created_at FROM users`);
        res.status(200).send({ status: "success", users: dbResponse.rows });
    } catch (error) {
        console.log("error", error);
        res.status(500).send({ status: "error", message: "Internal server error" });
    }
});

app.post('/api1/category', async (req, res) => {
    const reqBody = req.body;
    if (!reqBody.name) {
        res.status(400).send({ status: "error", message: "Required parameter missing" });
        return;
    }

    try {

        const dbQuery = "INSERT INTO categories (name, description) VALUES($1, $2)";
        const dbValues = [reqBody.name, reqBody.description];
        const dbResponse = await db.query(dbQuery, dbValues);
        res.status(201).send({ status: "success", message: "Category Added successfully" });

    } catch (err) {

        console.log("err", err);

        if (err.code == '23505') {
            res.status(400).send({ status: "error", message: "Category Already Exist" });
        } else {
            res.status(500).send({ status: "error", message: "Internal server error" });
        }
    }

});

app.put('/api1/category/:id', async (req, res) => {
    const reqBody = req.body;
    if (!reqBody.name) {
        res.status(400).send({ status: "error", message: "Required parameter missing" });
        return;
    }
    try {
        const dbQuery = "UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3";
        await db.query(dbQuery, [reqBody.name, reqBody.description || "", req.params.id]);
        res.status(200).send({ status: "success", message: "Category updated successfully" });
    } catch (err) {
        console.log("err", err);
        if (err.code == '23505') {
            res.status(400).send({ status: "error", message: "Category Already Exist" });
        } else {
            res.status(500).send({ status: "error", message: "Internal server error" });
        }
    }
});

app.delete('/api1/category/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
        res.status(200).send({ status: "success", message: "Category deleted successfully" });
    } catch (error) {
        console.log("error", error);
        res.status(500).send({ status: "error", message: "Internal server error" });
    }
});

app.post('/api1/products', async (req, res) => {

    const reqBody = req.body;
    if (!reqBody.name || !reqBody.images?.length || !reqBody.price || !reqBody.category_id) {
        res.status(400).send({ status: "error", message: "Required parameter missing" });
        return;
    }

    try {
        const dbQuery = "INSERT INTO products (category_id, name, description, price, stock, images) VALUES($1, $2, $3, $4, $5, $6)";
        const dbValues = [reqBody.category_id, reqBody.name, reqBody.description || "", reqBody.price, reqBody.stock || 0, reqBody.images];
        const dbResponse = await db.query(dbQuery, dbValues);
        res.status(201).send({ status: "success", message: "Product Add Successfully" });

    } catch (error) {
        console.log("error", error);
        res.status(500).send({ status: "error", message: "Internal server error" });
    }

});

app.delete('/api1/products/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.status(200).send({ status: "success", message: "Product deleted successfully" });
    } catch (error) {
        console.log("error", error);
        res.status(500).send({ status: "error", message: "Internal server error" });
    }
});


const __dirname = path.resolve();
const __frontend = path.join(__dirname, './ecommerc-web/build');
app.use('/', express.static(__frontend));
app.use("/*splat", express.static(__frontend));


app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
});