const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./router/pgConnect'); // DB 연결

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/JS', express.static(__dirname + "/JS"));
app.use('/css', express.static(__dirname + "/css"));
app.use('/image', express.static(__dirname + "/image"));

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// 로그인 페이지
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// 회원가입 페이지
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

// 회원가입 처리
app.post('/signup', (req, res) => {
    const user_table = [
        req.body.user_id,
        req.body.user_name,
        req.body.user_password,
        req.body.user_password_confirm,
        req.body.user_email,
        req.body.user_mobile,
        '일반' // 고정된 user_type
    ];

    const sql = 'INSERT INTO user_table (user_id, user_name, user_password, user_password_confirm, user_email, user_mobile, user_type) VALUES ($1,$2,$3,$4,$5,$6,$7)';

    db.query(sql, user_table, (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: 'error' });
        }
        return res.status(200).json({ result: 'ok' });
    });
});

// 로그인 처리 추가
app.post('/login', (req, res) => {
    const { user_id, user_password } = req.body;

    const sql = 'SELECT * FROM user_table WHERE user_id = $1 AND user_password = $2'; // 단순 평문 비밀번호 비교

    db.query(sql, [user_id, user_password], (err, result) => {
        if (err) {
            console.error('DB 오류:', err);
            return res.status(500).json({ result: 'db_error' });
        }

        if (result.rows.length > 0) {
            // 로그인 성공
            return res.status(200).json({ result: 'success', message: `${user_id}님 환영합니다.` });
        } else {
            // 로그인 실패
            return res.status(401).json({ result: 'fail', message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }
    });
});

app.listen(5000, () => {
    console.log("server running: http://localhost:5000");
});