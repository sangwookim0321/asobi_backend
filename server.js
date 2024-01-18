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
app.use(cors())

const gptApiRouter = require('./routes/gptApi')
app.use('/gpt-api', gptApiRouter)

app.listen(PORT, (req, res) => {
	console.log(`Server is running on port ${PORT}.`)
})
