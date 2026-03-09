import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req:Request){

  const body = await req.json()

  const filePath = path.join(process.cwd(),"data","words.json")

  const file = fs.readFileSync(filePath,"utf8")

  const words = JSON.parse(file)

  const newWord = {
    id: words.length + 1,
    ...body
  }

  words.push(newWord)

  fs.writeFileSync(
    filePath,
    JSON.stringify(words,null,2)
  )

  return NextResponse.json({success:true})
}