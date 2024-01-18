const OpenAI = require('openai')
const express = require('express')
const router = express.Router()

const openai = new OpenAI(process.env.OPENAI_API_KEY)

async function gpt(assistantId, prompt) {
	// ---------------------------- OPEN AI GPT 호출 ----------------------------
    thread = await openai.beta.threads.create()
    
    await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: prompt,
    })

	const run = await openai.beta.threads.runs.create(thread.id, {
		assistant_id: assistantId,
	})

    async function checkRunStatus(threadId, runId) {
        for (let i = 0; i < 1; i++) {
          // 최대 10번 시도
          const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId)
    
          console.log("runStatus: ", runStatus)
          if (runStatus.status === "completed") {
            let messages = await openai.beta.threads.messages.list(threadId, )
            return messages.data.map((msg) => ({
              role: msg.role,
              content: msg.content[0].text.value,
              threadId: threadId,
            }))
          }
    
          // 1초 간격으로 재시도
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
        throw new Error("Run did not complete in time.")
      }
    
      return await checkRunStatus(thread.id, run.id)
}

router.post('/dream-helper', async (req, res) => {
    	// ---------------------------- 꿈 해몽 GPT 어시스턴트 호출 ----------------------------
    const { type, prompt } = req.body

    if (!type) {
        return res.status(400).json({
            status: "error",
            message: 'Type is required',
        })
    }
    if (!prompt) {
        return res.status(400).json({
            status: "error",
            message: 'Prompt is required',
        })
    }

    let assistantId = ''
    if (type === 'dream') {
        assistantId = process.env.DREAM_ASSISTANT_ID
    }
    console.log('assistantId: ', assistantId)

    try {
        const response = await gpt(assistantId, prompt)

        res.status(200).json({
            status: "success",
            message: "GPT API response",
            data: response,
        })
    } catch (err) {
        console.error("/gpt-api/dream-helper error: ", err)
        res.status(500).json({
            status: "error",
            message: "Dream GPT Assistant 호출 중 서버 오류가 발생했습니다.",
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

module.exports = router