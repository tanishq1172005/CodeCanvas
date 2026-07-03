import express from 'express'
import dotenv from 'dotenv'
import { createClient } from 'redis'
import cors from 'cors'
import { prisma } from './db'

const client = createClient({
    url:process.env.REDIS_URL
})
client.connect()

dotenv.config({
    path:'./.env'
})

const app = express()
app.use(express.json())
app.use(cors({
    origin:'*'
}))

const port = process.env.PORT || 5000

app.post('/submission',async(req,res)=>{
    try{
        const {code,language} = req.body;

        if(!code || !language){
            res.status(400).json({message:"Missing Required fields"})
            return;
        }

        const response = await prisma.submissions.create({
        data:{
            language,
            code,
            status:"Processing"
        }
        })

        client.lPush("problems",JSON.stringify({submissionId:response.id,code,language}))

        res.json({
            message:"processing",
            id:response.id
        })
    }catch(err){
        return res.status(500).json({message:"Internal Server Error"})
    }    
})

app.get('/submission/:submissionId',async(req,res)=>{
    try{
        const response = await prisma.submissions.findFirst({
            where:{
                id:req.params.submissionId
            }
        })

        if(!response){
            res.status(400).json({message:"Invalid submission Id"})
        }

        res.status(200).json({
            submission:response
        })
    }catch(err){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

app.listen(port,()=>{
    console.log(`Listening at port:${port}`)
})