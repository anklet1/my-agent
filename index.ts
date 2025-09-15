
import { generateText } from "ai";
//import the google module from the ai-sdk package
import { google } from "@ai-sdk/google";

//specify the model to use for generating text and a prompt
const { text } = await generateText({
    model: google("models/gemini-2.5-flash"),
    prompt: " What will the future of AI will be like and what should we do to level  up?",
})

console.log(text);