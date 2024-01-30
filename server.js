const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const app = express()

if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' })
} else {
    dotenv.config({ path: '.env.development'})
}

const PORT = process.env.PORT || 9002

app.use(express.json())
const corsOptions = {
    origin: 'https://asobi-hardy.vercel.app',
    // credentials: true, // 인증 정보를 요청과 함께 보낼지 여부
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions)) // 프론트 도메인으로 변경

const gptApiRouter = require('./routes/gptApi')
app.use('/gpt-api', gptApiRouter)

app.listen(PORT, (req, res) => {
	console.log(`Server is running on port ${PORT}.`)
})
