import json
import requests
import logging
import os
from typing import Dict, Any, Optional, Union

# 配置日志
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('data_query_client')

# 后端API基础URL
BASE_URL = "http://localhost:3005"

def save_json_response_to_file(json_data) -> bool:
    """将API返回的JSON数据保存到2.json文件中
    
    Args:
        json_data: API返回的JSON数据（列表或字典）
        
    Returns:
        bool: 保存成功返回True，失败返回False
    """
    json_file_path = "c:/play_vue3/hd/test/2.json"
    
    try:
        logger.info(f"准备保存API返回数据到JSON文件: {json_file_path}")
        print(f"正在保存API返回数据到JSON文件: {json_file_path}")
        
        # 写入文件（覆盖模式，先清空文件内容）
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(json_data, json_file, ensure_ascii=False, indent=2)
        
        # 获取数据概览信息
        data_type = "列表" if isinstance(json_data, list) else "字典"
        data_count = len(json_data) if isinstance(json_data, (list, dict)) else "未知"
        
        logger.info(f"API返回数据保存成功到文件: {json_file_path}, 数据类型: {data_type}")
        print(f"✅ API返回数据保存成功: {data_type}, 数量: {data_count}")
        return True
    except Exception as e:
        logger.error(f"保存API返回数据到JSON文件失败: {str(e)}")
        print(f"❌ API返回数据保存失败: {str(e)}")
        return False

def query_data(
    query_keyword: str,
    timeout: int = 30,
    api_key: str = 'default_api_key'
) -> Optional[Dict[str, Any]]:
    """查询数据，调用/api/data接口
    
    Args:
        query_keyword: 查询关键字
        timeout: 请求超时时间，默认30秒
        api_key: API密钥，默认为'default_api_key'
        
    Returns:
        响应结果字典，如果请求失败返回包含错误信息的字典
    """
    # 验证参数
    if not query_keyword or not isinstance(query_keyword, str):
        error_msg = "query_keyword必须是非空字符串"
        logger.error(f"数据格式验证失败: {error_msg}")
        print(f"错误: {error_msg}")
        return {"success": False, "error": error_msg}
    
    # 注意：不再保存查询参数，改为在查询成功后保存API返回的完整数据
    # 数据保存逻辑已移至查询成功后的代码块中
    
    # 构建查询URL和参数
    url = f"{BASE_URL}/api/data"
    params = {
        "query_keyword": query_keyword
    }
    
    # 设置请求头，包含认证信息
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        logger.info(f"准备查询数据: {url}, query_keyword: {query_keyword}")
        print(f"准备查询数据: {url}")
        print(f"查询参数: query_keyword={query_keyword}")
        
        # 发送GET请求
        response = requests.get(
            url,
            params=params,
            timeout=timeout,
            headers=headers
        )
        
        logger.info(f"收到响应，状态码: {response.status_code}")
        
        # 检查响应状态码
        response.raise_for_status()
        
        # 尝试解析JSON响应
        try:
            result = response.json()
            logger.info(f"查询成功，获取到数据")
            print(f"查询成功，响应状态: {response.status_code}")
            
            # 保存API返回的数据到2.json文件
            save_json_response_to_file(result)
            
            # 显示结果摘要
            print(f"\n=== API调用结果摘要 ===")
            print(f"✅ 查询成功!")
            
            # 显示响应数据
            print(f"\n=== 查询结果 ===")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            
            return result
        except json.JSONDecodeError:
            logger.warning(f"无法解析响应为JSON，原始响应: {response.text[:200]}...")
            print(f"响应解析错误，无法解析JSON数据")
            
            # 显示结果摘要
            print(f"\n=== API调用结果摘要 ===")
            print(f"❌ 查询失败: Invalid JSON response")
            return {"success": False, "error": "Invalid JSON response", "raw_response": response.text[:500]}
            
    except requests.exceptions.ConnectionError as e:
        logger.error(f"无法连接到服务器: {str(e)}")
        print(f"网络连接错误，无法连接到接口: {url}")
        
        # 显示结果摘要
        print(f"\n=== API调用结果摘要 ===")
        print(f"❌ 查询失败: Connection error")
        return {"success": False, "error": "Connection error", "details": str(e)}
    except requests.exceptions.Timeout as e:
        logger.error(f"请求超时: {str(e)}")
        print(f"请求超时，超过{timeout}秒")
        
        # 显示结果摘要
        print(f"\n=== API调用结果摘要 ===")
        print(f"❌ 查询失败: Request timeout")
        return {"success": False, "error": "Request timeout", "details": str(e)}
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        reason = e.response.reason
        logger.error(f"HTTP错误 {status_code}: {reason}")
        print(f"HTTP错误，状态码: {status_code}, 错误信息: {str(e)}")
        
        # 显示结果摘要
        print(f"\n=== API调用结果摘要 ===")
        try:
            # 尝试获取错误详情
            error_detail = e.response.json() if e.response.text else {}
            logger.error(f"错误详情: {error_detail}")
            error_msg = error_detail.get('error', f"HTTP error: {status_code}")
            print(f"❌ 查询失败: {error_msg}")
            return {"success": False, "error": error_msg, "details": error_detail}
        except Exception as json_error:
            logger.error(f"无法解析错误响应: {str(json_error)}")
            print(f"❌ 查询失败: HTTP error: {status_code}")
            return {"success": False, "error": f"HTTP error: {status_code}", "raw_response": e.response.text[:500]}
    except Exception as e:
        logger.error(f"发生未知错误: {str(e)}", exc_info=True)
        print(f"查询时发生未知错误: {str(e)}")
        
        # 显示结果摘要
        print(f"\n=== API调用结果摘要 ===")
        print(f"❌ 查询失败: Unknown error")
        return {"success": False, "error": f"Unknown error: {str(e)}"}
      
    return None

def get_query_keyword():
    """通过命令行输入获取查询关键字
    
    Returns:
        str: 查询关键字
    """
    while True:
        query_keyword = input("请输入查询关键字 (query_keyword): ").strip()
        if query_keyword:
            return query_keyword
        print("错误: 查询关键字不能为空")

def display_menu():
    """显示主菜单"""
    print("\n" + "="*50)
    print("              数据查询工具              ")
    print("="*50)
    print("1. 调用 /api/data 接口进行查询")
    print("0. 退出")
    print("="*50)

def main():
    """主函数"""
    print("数据查询工具已启动")
    
    while True:
        display_menu()
        choice = input("请选择操作 (0-1): ").strip()
        
        if choice == '0':
            print("\n感谢使用，再见！")
            break
        
        elif choice == '1':
            print("\n您选择了: 调用 /api/data 接口进行查询")
            
            # 获取查询参数
            query_keyword = get_query_keyword()
            
            # 调用查询接口
            result = query_data(query_keyword=query_keyword)
            
            # 显示结果
            # 处理API返回的结果，可能是列表或字典
            if result:
                if isinstance(result, list):
                    # 如果是列表，说明查询成功并返回了数据
                    print(f"\n✅ 操作成功完成！共获取到 {len(result)} 条数据")
                elif isinstance(result, dict) and result.get('success') is not False:
                    # 如果是字典且success不为False
                    print("\n✅ 操作成功完成！")
                else:
                    print("\n❌ 操作失败，请检查错误信息")
            else:
                print("\n❌ 操作失败，请检查错误信息")
        
        else:
            print("无效的选择，请重新输入")
        
        # 等待用户按回车键继续
        input("\n按回车键继续...")

if __name__ == "__main__":
    main()