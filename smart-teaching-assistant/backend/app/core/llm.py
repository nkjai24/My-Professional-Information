from openai import OpenAI

client = OpenAI()


class LLM:
    def chat(self, system: str, user: str) -> str:
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            )

            # ✅ Safe extraction
            if (
                response
                and response.choices
                and len(response.choices) > 0
                and response.choices[0].message
                and response.choices[0].message.content
            ):
                return response.choices[0].message.content.strip()

            return "Sorry, I couldn't generate a response. Please try again."

        except Exception as e:
            # ✅ Prevent silent failure
            print("LLM Error:", e)
            return "Sorry, I’m having trouble answering right now. Please try again."


llm = LLM()