const express = require('express');
const mysql = require("mysql2");
const bcrypt = require('bcryptjs');

const app = express();
const cors = require('cors');

app.use(express.json());
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Org1lshdehamude",
    database: "biydaalt"
});


app.use(cors({
    origin: 'http://localhost:3000',
}));

connection.connect((err) => {
    if (err) {
        console.log("error connecting to MySQL:" + err.stack);
        return;
    }
    console.log("Connected to MySQL as id" + connection.threadId);
});

app.get('/students', (req, res) => {
    connection.query('select * from students', (error, results) => {
        if (error) {
            console.log("Error executing query: " + error);
            res.status(500).send("Error retrieving users");
            return;
        }
        res.json(results)
    })
})


app.post('/students', (req, res) => {
    const { id, firstname, lastname, age, gender, school, class_name, gpa } = req.body;

    connection.query(`SELECT * FROM students WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Error executing query: " + error);
            res.status(500).send("Error checking for existing student");
            return;
        }

        if (results.length > 0) {
            res.status(400).send("Энэ ID-тай оюутан аль хэдийн байна");
            return;
        }
        if (firstname == "" || lastname == "" || age == "" || gender == "" || school == "" || class_name == "" || gpa == "") {
            res.status(400).send("Талбарыг бүрэн бөглөнө үү?");
            return;
        }
        else {

            connection.query(`INSERT INTO students (id, firstname, lastname, age, gender, school, class_name, gpa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, firstname, lastname, age, gender, school, class_name, gpa], (error, results) => {
                    if (error) {
                        console.log("Error executing query: " + error);
                        res.status(500).send("Cурагч нэмэхэд алдаа гарлаа");
                        return;
                    }
                    res.status(200).send(`Амжилттай ${firstname} нэртэй сурагч нэмлээ`)
                });
        }
    });
});




app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
    connection.query(`DELETE FROM students WHERE id = ${id}`, [id], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Сурагчийг устгахад алдаа гарлаа");
            return;
        }
        res.status(200).send("Сурагчийг амжилттай устгасан");
    });
});


app.patch('/students/:id', (req, res) => {
    const { firstname, lastname, age, gender, school, class_name, gpa } = req.body;
    const { id } = req.params
    connection.query(`UPDATE students set firstname="${firstname}",lastname="${lastname}",age=${age},gender="${gender}",school="${school}", class_name="${class_name}",gpa=${gpa} WHERE id = ${id}`, [id, firstname, lastname, age, gender, school, class_name, gpa], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error updating student");
            return;
        }
        res.status(200).send("Сурагчийг амжилттай шинэчилсэн");
    });
});









app.get('/users', (req, res) => {
    connection.query('select * from users', (error, results) => {
        if (error) {
            console.log("Error executing query: " + error);
            res.status(500).send("Error retrieving users");
            return;
        }
        res.json(results)
    })
})


app.post('/register', (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    if (firstname == "" || lastname == "" || email == "" || password == "") {
        res.status(400).send("Талбарыг бүрэн бөглөнө үү?");
        return;
    }
    else {
        connection.query(`SELECT * FROM users WHERE email = "${email}"`, [email], (error, results) => {
            if (error) {
                console.log("Error executing query: " + error);
                res.status(500).send("Error retrieving users");
                return;
            }
            if (results.length > 0) {
                res.status(400).send("Email чинь бүртгэгдcэн байна ");
                return;
            }
            const hashedPassword = bcrypt.hashSync(password, 10);
            connection.query(`INSERT INTO users(firstname,lastname,email,password) VALUES ("${firstname}", "${lastname}","${email}","${hashedPassword}")`,
                [firstname, lastname, email, hashedPassword], (error, results) => {
                    if (error) {
                        console.log("Error executing query: " + error);
                        res.status(500).send("Error retrieving users");
                        return;
                    }
                    res.status(200).send("Амжилттай бүртгүүллээ");
                });
        });
    }
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email == "" || password == "") {
        res.status(400).send("Талбарыг бүрэн бөглөнө үү?");
        return;
    }
    else {
        connection.query(`SELECT * FROM users WHERE email = "${email}"`, [email], (error, results) => {
            if (error) {
                console.log("Error executing query: " + error);
                res.status(500).send("Error retrieving users");
                return;
            }
            if (results.length > 0) {
                const user = results[0];
                const hashedPassword = user.password.replace("$2y$", "$2a$");
                bcrypt.compare(password, hashedPassword, (bcryptErr, passwordMatch) => {
                    if (bcryptErr) {
                        console.log("login failed");
                        res.status(500).send("internal error");
                        return;
                    }
                    if (passwordMatch) {
                        res.json("Амжилттай нэвтэрлээ");
                        return;
                    }
                    else {
                        res.status(400).send("Password таарахгүй байна")
                        return
                    }
                })
                return;
            }
            else {
                res.status(400).send("Ийм email олдохгүй байна");
                return;
            }
        });
    }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Running Express Server on Port ${PORT}!`));
