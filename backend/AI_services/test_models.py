import google.generativeai as genai

genai.configure(api_key="AIzaSyCTW8-KhJsFcUt0mQo5WeM9nT-ZQZW7xik")

for m in genai.list_models():
    print(m.name, m.supported_generation_methods)