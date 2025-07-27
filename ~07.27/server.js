const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // 세션 모듈 추가
const app = express();
const db = require('./router/pgConnect');

// 미들웨어 설정
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 세션 설정 추가
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

// 정적 파일 제공
app.use('/JS', express.static(__dirname + "/JS"));
app.use('/css', express.static(__dirname + "/css"));
app.use('/image', express.static(__dirname + "/image"));

// 메인 페이지
app.get('/', (req, res) => {
  if (req.session.user) {
    const name = req.session.user.name;
    res.send(`
      <html>
        <head><meta charset="UTF-8"><title>홈페이지</title></head>
        <body>
          <h1>${name}님, 환영합니다!</h1>
          <ul>
            <li><a href="/logout">로그아웃</a></li>
            <li><a href="/board">게시판으로 이동</a></li>
          </ul>
        </body>
      </html>
    `);
  } else {
    res.sendFile(__dirname + '/public/index.html');
  }
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
        '일반'
    ];

    const sql = 'INSERT INTO user_table (user_id, user_name, user_password, user_password_confirm, user_email, user_mobile, user_type) VALUES ($1,$2,$3,$4,$5,$6,$7)';

    db.query(sql, user_table, (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('<h1>회원가입 실패</h1><a href="/signup">다시 시도하기</a>');
        }
        return res.redirect('/login');
    });
});

// 로그인 처리
app.post('/login', (req, res) => {
    const { user_id, user_password } = req.body;

    const sql = 'SELECT * FROM user_table WHERE user_id = $1 AND user_password = $2';

    db.query(sql, [user_id, user_password], (err, result) => {
        if (err) {
            console.error('DB 오류:', err);
            return res.status(500).send('<h1>서버 오류 발생</h1>');
        }

        if (result.rows.length > 0) {
            req.session.user = {
                user_id: result.rows[0].user_id,
                name: result.rows[0].user_name
            };
            return res.redirect('/');
        } else {
            return res.status(401).send('<h1>로그인 실패</h1><a href="/login">다시 로그인</a>');
        }
    });
});

// 로그아웃 처리
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('로그아웃 실패');
        }
        res.redirect('/');
    });
});

// 게시글 작성 페이지
app.get('/write', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send("로그인 후 이용 가능합니다.");
    }
    res.sendFile(__dirname + '/public/write.html');
});

// 게시글 작성 처리
app.post('/write', (req, res) => {
    const { title, content } = req.body;
    const writer = req.session.user ? req.session.user.user_id : '익명';

    const sql = 'INSERT INTO post_table (title, content, writer) VALUES ($1, $2, $3)';
    const values = [title, content, writer];

    db.query(sql, values, (err) => {
        if (err) {
            console.error('게시글 작성 오류:', err);
            return res.status(500).send("DB 오류");
        }
        return res.redirect('/board');
    });
});

// 게시판 페이지
app.get('/board', (req, res) => {
    res.sendFile(__dirname + '/public/board.html');
});

app.get('/api/posts', (req, res) => {
    const sql = 'SELECT * FROM post_table ORDER BY created_at DESC';

    db.query(sql, (err, result) => {
        if (err) {
            console.error('게시글 조회 오류:', err);
            return res.status(500).json({ error: 'DB 오류' });
        }
        return res.status(200).json(result.rows);
    });
});

app.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({
            user_id: req.session.user.id,
            user_name: req.session.user.name
        });
    } else {
        res.json({ user_id: null });
    }
});

// 서버 시작
app.listen(5000, () => {
    console.log("server running: http://localhost:5000");
});
