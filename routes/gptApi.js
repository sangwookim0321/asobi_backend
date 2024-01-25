const OpenAI = require('openai')
const express = require('express')
const router = express.Router()

const openai = new OpenAI(process.env.OPENAI_API_KEY)

async function gpt(assistantId, prompt, threadId) {
	// ---------------------------- OPEN AI GPT 호출 ----------------------------
    let thread = {}
    if (!threadId) {
        thread = await openai.beta.threads.create()
    } else {
        thread.id = threadId
    }
    
    await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: prompt,
    })

	const run = await openai.beta.threads.runs.create(thread.id, {
		assistant_id: assistantId,
	})

    // 작업 완료 여부를 체크하는 함수
  async function checkRunStatus(threadId, runId) {
    for (let i = 0; i < 30; i++) {
      // 최대 30번 시도
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId)

      if (runStatus.status === "completed") {
        let messages = await openai.beta.threads.messages.list(threadId, {limit: 1, order: 'desc'})
        return messages.data.map((msg) => ({
          role: msg.role,
          content: msg.content[0].text.value,
          threadId: threadId,
        }))
      }

      // 4초 간격으로 재시도
      await new Promise((resolve) => setTimeout(resolve, 4000))
    }
    throw new Error("Run did not complete in time.")
  }

  return await checkRunStatus(thread.id, run.id)
}

router.post('/gpt-helper', async (req, res) => {
    	// ---------------------------- GPT 어시스턴트 호출 ----------------------------
    let { type, prompt } = req.body

    if (!type) {
        return res.status(400).json({
            status: "error",
            message: 'Type is required',
        })
    }
    if (type === 'dream' && !prompt) {
        return res.status(400).json({
            status: "error",
            message: 'Prompt is required',
        })
    }
    if (type === 'lotto' && !prompt) {
        prompt = '로또 번호 추천해줘'
    }


    let assistantId = ''
    if (type === 'dream') {
        assistantId = process.env.DREAM_ASSISTANT_ID
    } else if (type === 'lotto') {
        assistantId = process.env.LOTTO_ASSISTANT_ID
    }

    try {
        const response = await gpt(assistantId, prompt)

        res.status(200).json({
            status: "success",
            message: "GPT API response",
            data: response,
        })
    } catch (err) {
        console.error("/gpt-api/gpt-helper error: ", err)
        res.status(500).json({
            status: "error",
            message: "GPT Assistant 호출 중 서버 오류가 발생했습니다.",
            error: err,
        })
    }
})

router.delete('/gpt-thread', async (req, res) => {
	// ---------------------------- 쓰레드 삭제 ----------------------------
	const threadId = req.query.threadId

	if (!threadId) {
		return res.status(400).json({
			status: 'error',
			message: 'threadId를 제공해주세요.',
		})
	}

	try {
		const response = await openai.beta.threads.del(threadId)

		res.status(200).json({
			status: 'success',
			message: '해당 GPT Assistant thread 를 삭제했습니다.',
			result: response,
		})
	} catch (err) {
		console.error('/gpt-api/gpt-thread Error : ', err)

		res.status(500).json({
			status: 'error',
			message: 'GPT Assistant Thread 삭제 중 서버 오류가 발생했습니다.',
		})
	}
})

router.post('/gpt-chat', async (req, res) => {
    const { prompt, type, threadId } = req.body

    if (!prompt) {
        return res.status(400).json({
            status: 'error',
            message: 'Prompt is required',
        })
    }
    if (!type) {
        return res.status(400).json({
            status: 'error',
            message: 'Type is required',
        })
    }

    let assistantId = ''
    if (type === 'MODEL_1') {
        assistantId = process.env.CHAT_ASSISTANT_MODEL_1_ID
    } else if (type === 'MODEL_2') {
        assistantId = process.env.CHAT_ASSISTANT_MODEL_2_ID
    }

    try {
        const response = await gpt(assistantId, prompt, threadId)

        res.status(200).json({
            status: 'success',
            message: 'GPT API response',
            data: response,
        })
    } catch (err) {
        console.error('/gpt-api/gpt-chat Error : ', err)

        res.status(500).json({
            status: 'error',
            message: 'GPT Assistant 호출 중 서버 오류가 발생했습니다.',
            error: err,
        })
    }
})

router.post('/gpt-mbit-helper', async (req, res) => {
    const { prompt, threadId } = req.body

    if (!prompt) {
        return res.status(400).json({
            status: 'error',
            message: 'Prompt is required',
        })
    }

    const assistantId = process.env.MBIT_ASSISTANT_ID

    try {
        const response = await gpt(assistantId, prompt, threadId)

        res.status(200).json({
            status: 'success',
            message: 'GPT API response',
            data: response,
        })
    } catch (err) {
        console.error('/gpt-api/gpt-mbit-helper Error : ', err)

        res.status(500).json({
            status: 'error',
            message: 'GPT Assistant 호출 중 서버 오류가 발생했습니다.',
            error: err,
        })
    }
})

router.post('/test-api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'GPT API Test',
        data: {
            content: '[15, 26, 28, 34, 41, 42, 44]',
            role: 'assistant',
            threadId: 'thrd_1J7G5H4Y8QV7X4X5',
        }
    })
})

module.exports = router