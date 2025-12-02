import requests
import json


def test_create_story():
    url = "http://localhost:8000/api/stories/"
    payload = {
        "author": "测试作者",
        "beloved": "测试恋人",
        "meet_date": "2025-12-01",
        "meet_place": "测试地点",
        "quote": "测试想说的话",
        "story": "测试故事，这段文字需要超过50个字，这样测试才有效。测试故事，这段文字需要超过50个字，这样测试才有效。",
        "images": [],
    }
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print("成功！")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except requests.exceptions.RequestException as e:
        print(f"错误: {e}")
        if hasattr(e, "response") and e.response is not None:
            print(f"响应状态码: {e.response.status_code}")
            print(f"响应文本: {e.response.text}")


if __name__ == "__main__":
    test_create_story()
