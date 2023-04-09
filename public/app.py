from flask import Flask, request, jsonify
import requests
import json
from flask_cors import CORS

app = Flask(__name__)
# app.debug = True
CORS(app, supports_credentials=True)

api_key = "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"

class ChatContextPool:
    def __init__(self):
        self.pool = {}

    def add_message(self, user_id, role, content):
        if user_id not in self.pool:
            self.pool[user_id] = []

        self.pool[user_id].append({"role": role, "content": content})

    def get_context(self, user_id):
        return self.pool.get(user_id, [])  # 如果没有则返回空列表

    def request_chat_gpt(self, user_id, user_message, api_key, temperature=0.7):
        self.add_message(user_id, "user", user_message)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "gpt-3.5-turbo",
            "messages": self.get_context(user_id),
            "temperature": temperature
        }
        
        print("提问：",user_message)

        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            data=json.dumps(data)
        )

        result = response.json()
        try:
          generated_text = result["choices"][0]["message"]["content"]
          print("回答：",generated_text)
          self.add_message(user_id, "assistant", generated_text)
        except:
          print("error:",result)

        return generated_text


chat_pool = ChatContextPool()


# 使用示例


# # 与用户1的交流
# response1 = chat_pool.request_chat_gpt("user1", "请问你是？", api_key)
# print("回答1:", response1)
#
# response2 = chat_pool.request_chat_gpt("user1", "你能告诉我关于太阳系的一些信息吗？", api_key)
# print("回答2:", response2)
#
# # 与用户2的交流
# response3 = chat_pool.request_chat_gpt("user2", "你知道清明节吗？", api_key)
# print("回答3:", response3)
#
# response2 = chat_pool.request_chat_gpt("user1", "我之前问了你什么？", api_key)
# print("回答4:", response2)
#
# response2 = chat_pool.request_chat_gpt("user2", "我之前问了你什么？", api_key)
# print("回答5:", response2)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


# 获取生成的ppt大纲
@app.route('/get_catalog', methods=['POST'])
def get_catalog():
    # 从请求体获取 JSON 数据
    prompt = """
⽤⼾: ⽣成介绍 {{topic}} 的⼤纲,汇报人叫做{{user_name}}， 仿照以下格式， 不要带上任何注释性⽂字
<slides>
<section class='封面'>
    <!--第一张幻灯片-->
    <h1>《论语》</h1>
    <p>汇报人：</p>
</section>
<section class='目录页'>
    <!--只用给出目录项-->
    <h1> 目录 </h1>
    <h2> 目录项1 </h2>
    <h2> 目录项2 </h2>
    <h2> 目录项3 </h2>
</section>
<section class='内容'>
    <!--只用给出一个标题和一个内容概要即可-->
    <hl> 标题 </hl>
    <p>内容概要</p>
</section>
<!--更多的幻灯片・・・-->
</slides>
    """
    # receive_data:dict = json.loads(request.data.decode('utf-8'))
    print('receive:',request.form,type(request.form))
    # 从 JSON 数据中获取 'prompt' 参数
    core_prompt = request.form.get('prompt')
    user_name = request.form.get('user_name')
 
    prompt = prompt.replace("{{topic}}", core_prompt)
    prompt = prompt.replace("{{user_name}}", user_name)

    # 使用 prompt 处理和生成您的 PPT 大纲
    generated_text = chat_pool.request_chat_gpt(user_name, prompt, api_key)
    
    

    chat_pool.add_message(user_name, "assistant", generated_text)

    print('generated_text',generated_text)
    
    return {
      'data' : generated_text
    }


# 获取生成的ppt详细页
@app.route('/get_detail', methods=['POST'])
def get_detail():
    # ⽤⼾：根据以上内容，仿照下列格式，不要带上任何注释⽂字
    prompt = request.form.get("prompt")
    user_name = request.form.get('user_name')
    prompt += """
    根据以上内容，仿照下列格式，不要带上任何注释⽂字
<section class='内容'>
    <!--给出一个标题和2-3点内容(内容应较详细)即可-->
    <h1> 标题 </h1>
    <p> 第一点...</p>
    <p> 第二点...</p>
    <p> 第三点...</p>
</section>
    """
    generated_text = chat_pool.request_chat_gpt(user_name, prompt, api_key)
    return generated_text

# 输入：用户对ppt的编辑指令和ppt的xml字符串
# 返回：更新后的ppt的xml字符串
@app.route('/update_slides', methods=['POST'])
def update_slides():
    print('receive:',request.form,type(request.form))
    
    user_name = request.form.get('user_name')
    prompt = request.form.get('prompt')
    ppt_xml = request.form.get('ppt_xml')
    
    final_prompt = '''
    你将接收用户的指令去处理一个ppt，ppt的表示方式是xml格式的字符串。
    用户的指令是：{0}。请同时帮我把这个ppt中双括号{2}括起来的部分替换为‘{0}’相关内容；
    要处理的ppt是：{1}；
    请你按照用户的指令对以xml格式表示的ppt进行处理。
    注意：你只用返回处理后的xml格式字符串，且不要带任何注释，谢谢！
    说明：用双括号{2}括起来的文本表示模板信息，是你一定要替换的部分'''.format(prompt,ppt_xml,'{{}}')
    
    generated_text = chat_pool.request_chat_gpt(user_name, final_prompt, api_key)

    chat_pool.add_message(user_name, "assistant", generated_text)
    
    # generated_text= 'okok'
    
    return {
      'code' : 200,
      'data' : {
        "xml_ppt":generated_text,
      },
      'msg' : 'ok'
    }


if __name__ == '__main__':
    app.run()
