const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const https = require('https')
const http = require('http')
const app = express()

// 환경 설정 파일 로드
if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' })
} else {
    dotenv.config({ path: '.env.development' })
}

const PORT = process.env.PORT || 9002

app.use(express.json())
const corsOptions = {
    origin: 'https://asobi-hardy.vercel.app',
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

const gptApiRouter = require('./routes/gptApi')
app.use('/gpt-api', gptApiRouter)

// 프로덕션 환경에서는 HTTPS 서버 실행
if (process.env.NODE_ENV === 'production') {
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/pointjumpit.duckdns.org/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/pointjumpit.duckdns.org/fullchain.pem')
    }

    https.createServer(options, app).listen(PORT, () => {
        console.log(`Prod HTTPS Server is running on port ${PORT}.`)
    })
} else {
    // 개발 환경에서는 HTTP 서버 실행
    http.createServer(app).listen(PORT, () => {
        console.log(`Dev HTTP Server is running on port ${PORT}.`)
    })
}
