"use client"

import { useState } from "react"

export default function AdminPage() {

  const [text,setText] = useState("")
  const [source,setSource] = useState("")
  const [category,setCategory] = useState("")
  const [speaker,setSpeaker] = useState("")

  const [batchText,setBatchText] = useState("")
  const [mode,setMode] = useState("single")
  const [loading,setLoading] = useState(false)

  async function addWord(){

    setLoading(true)

    await fetch("/api/addWord",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        text,
        source,
        category,
        speaker
      })
    })

    setText("")
    setSource("")
    setCategory("")
    setSpeaker("")

    setLoading(false)

    alert("말씀 추가 완료")
  }

  async function addBatchWords(){

    setLoading(true)

    const lines = batchText
      .split("\n")
      .map(l=>l.trim())
      .filter(Boolean)

    for(const line of lines){

      const [text,source,category,speaker] = line.split("|")

      await fetch("/api/addWord",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          text: text?.trim(),
          source: source?.trim(),
          category: category?.trim(),
          speaker: speaker?.trim()
        })
      })

    }

    setBatchText("")
    setLoading(false)

    alert(lines.length + "개의 말씀 추가 완료")
  }

  return (

    <div className="max-w-xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        말씀 추가 Admin
      </h1>

      <div className="flex gap-3 mb-6">

        <button
          onClick={()=>setMode("single")}
          className={`px-4 py-2 rounded ${mode==="single" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
        >
          하나 추가
        </button>

        <button
          onClick={()=>setMode("batch")}
          className={`px-4 py-2 rounded ${mode==="batch" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
        >
          여러개 추가
        </button>

      </div>

      {mode==="single" && (

        <div>

          <textarea
            placeholder="말씀"
            value={text}
            className="border p-3 w-full mb-4 rounded"
            onChange={(e)=>setText(e.target.value)}
          />

          <input
            placeholder="출처"
            value={source}
            className="border p-3 w-full mb-4 rounded"
            onChange={(e)=>setSource(e.target.value)}
          />

          <input
            placeholder="카테고리"
            value={category}
            className="border p-3 w-full mb-4 rounded"
            onChange={(e)=>setCategory(e.target.value)}
          />

          <input
            placeholder="말한 사람 (예: 예수님)"
            value={speaker}
            className="border p-3 w-full mb-4 rounded"
            onChange={(e)=>setSpeaker(e.target.value)}
          />

          <button
            onClick={addWord}
            disabled={loading}
            className="bg-indigo-500 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "저장중..." : "저장"}
          </button>

        </div>

      )}

      {mode==="batch" && (

        <div>

          <div className="bg-gray-100 p-4 mb-4 rounded text-sm">

            입력 형식 (한 줄에 하나)

            <br/><br/>

            text | source | category | speaker

            <br/><br/>

            예시

            <br/>

            믿음은 바라는 것들의 실상이다 | 히브리서 11:1 | 성경 | 바울  
            사랑은 모든 것을 이긴다 | 명언 | 명언 | 톨스토이

          </div>

          <textarea
            value={batchText}
            className="border p-3 w-full mb-4 rounded h-40 font-mono"
            placeholder="여기에 여러 말씀을 붙여넣기"
            onChange={(e)=>setBatchText(e.target.value)}
          />

          <button
            onClick={addBatchWords}
            disabled={loading}
            className="bg-indigo-500 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "저장중..." : "여러 말씀 저장"}
          </button>

        </div>

      )}

    </div>

  )
}