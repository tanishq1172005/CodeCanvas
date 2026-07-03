import axios from 'axios'
import { useRef, useState } from 'react'
import './index.css'
const BACKEND_URL = 'http://localhost:5000'
import { Button } from './components/ui/button'
export function App(){
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [status,setStatus] = useState('')
    const [output,setOutput] = useState('')
    const [selectedLanguage,setSelectedLanguage] = useState('')

    const pollBackend = async(submissionId:string) =>{
        const response = await axios.get(`${BACKEND_URL}/submission/${submissionId}`)
        if(response.data.submission.status !== "Processing"){
            setStatus(response.data.submission.status)
            setOutput(response.data.submission.output)
        }else{
            await new Promise(r=>setTimeout(r,3000))
            pollBackend(submissionId)
        }
    }

    return(
    <>
    <div className='w-screen bg-gray-800 p-4 text-white border-b-2 border-gray-300'>
        <h1 className='font-medium text-xl'>CodeCanvas</h1>
        <p className='font-light text-sm'>Online Compiler for JavaScript, Python and C++</p>
    </div>
    <div className='w-screen h-screen flex text-white'>
        <div className='flex-1 bg-gray-800 border-r-2 border-white'>
            <div className='flex justify-between'>
                <div className='space-x-2'>
                    <Button size={"sm"} variant={selectedLanguage === "cpp"? "destructive":"outline"} onClick={()=>setSelectedLanguage("cpp")}>cpp</Button>
                    <Button size={"sm"} variant={selectedLanguage === "js"? "destructive":"outline"} onClick={()=>{setSelectedLanguage("js")}}>JS</Button>
                    <Button size={"sm"} variant={selectedLanguage === "py"? "destructive":"outline"} onClick={()=>setSelectedLanguage("py")}>Python</Button>
                </div>
                <div>
                    <Button onClick={async()=>{
                        setStatus("Processing")
                        setOutput("")

                        const response = await axios.post(`${BACKEND_URL}/submission`,{
                            "code":textAreaRef.current!.value,
                            "language":selectedLanguage
                        })
                        pollBackend(response.data.id)
                    }} variant={"outline"}>Submit</Button>
                </div>
            </div>
            <div>
                <textarea ref={textAreaRef} className='h-screen w-full focus:outline-none m-4' rows={500}></textarea>
            </div>
        </div>
        <div className='flex-1 bg-gray-800'>
            <div className='m-4 font-medium'>{status}</div>
            <div className='m-4 font-light'>{output}</div>
        </div>
    </div>
    </>
    )
}