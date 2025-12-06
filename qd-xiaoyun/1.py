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
logger = logging.getLogger('ai_workflow_client')

# 后端API基础URL
BASE_URL = "http://192.168.149.54:3005"

def send_ai_workflow_data(
    userid: Union[int, str, None] = None,
    codeid: str = None,
    html: str = None,
    json_file_path: str = None,
    timeout: int = 30,
    api_key: str = 'default_api_key'
) -> Optional[Dict[str, Any]]:
    """发送AI工作流数据到后端接口 /api/submit-form-data
    
    支持两种调用方式：
    1. 直接提供参数：userid, codeid, html
    2. 从JSON文件读取：指定json_file_path
    
    Args:
        userid: 用户ID，整数或字符串类型
        codeid: 表单操作码，字符串类型
        html: HTML内容，字符串类型
        json_file_path: JSON文件路径，可选
        timeout: 请求超时时间，默认30秒
        api_key: API密钥，默认为'default_api_key'
        
    Returns:
        响应结果字典，如果请求失败返回包含错误信息的字典
    """
    # 从JSON文件读取数据（如果提供了文件路径）
    if json_file_path is not None:
        try:
            # 设置默认文件路径
            if json_file_path == 'default':
                json_file_path = os.path.join(os.path.dirname(__file__), '1.json')
            
            # 检查文件是否存在
            if not os.path.exists(json_file_path):
                logger.error(f"JSON文件不存在: {json_file_path}")
                print(f"错误: JSON文件不存在: {json_file_path}")
                return {"success": False, "error": "JSON文件不存在"}
            
            # 读取JSON文件
            logger.info(f"正在读取JSON文件: {json_file_path}")
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 提取必要字段
            userid = data.get('userid')
            codeid = data.get('codeid')
            html = data.get('html')
            
            # 检查字段是否齐全
            required_fields = ['userid', 'codeid', 'html']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                logger.error(f"JSON文件缺少必要字段: {missing_fields}")
                print(f"错误: JSON文件缺少必要字段: {missing_fields}")
                return {"success": False, "error": f"缺少必要字段: {missing_fields}"}
            
            # 显示文件读取信息
            print(f"\n=== 从JSON文件读取数据 ===")
            print(f"文件路径: {json_file_path}")
            print(f"userid: {userid}")
            print(f"codeid: {codeid[:20]}...")
            print(f"html内容长度: {len(html)} 字符")
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON文件解析错误: {str(e)}")
            print(f"错误: JSON文件格式不正确: {str(e)}")
            return {"success": False, "error": f"JSON解析错误: {str(e)}"}
        except Exception as e:
            logger.error(f"读取JSON文件时发生错误: {str(e)}", exc_info=True)
            print(f"错误: 读取JSON文件时发生未知错误: {str(e)}")
            return {"success": False, "error": f"读取文件错误: {str(e)}"}
    
    # 数据格式验证
    # 验证userid
    if userid is None:
        error_msg = "userid不能为空"
        logger.error(f"数据格式验证失败: {error_msg}")
        print(f"错误: {error_msg}")
        return {"success": False, "error": error_msg}
    
    # 检查userid类型，转换为整数
    try:
        if isinstance(userid, str):
            int(userid)
    except ValueError:
        error_msg = "userid必须是整数或可以转换为整数的字符串"
        logger.error(f"数据格式验证失败: {error_msg}")
        print(f"错误: {error_msg}")
        return {"success": False, "error": error_msg}
    
    # 验证codeid
    if not codeid or not isinstance(codeid, str):
        error_msg = "codeid必须是非空字符串"
        logger.error(f"数据格式验证失败: {error_msg}")
        print(f"错误: {error_msg}")
        return {"success": False, "error": error_msg}
    
    # 验证html
    if not html or not isinstance(html, str):
        error_msg = "html必须是非空字符串"
        logger.error(f"数据格式验证失败: {error_msg}")
        print(f"错误: {error_msg}")
        return {"success": False, "error": error_msg}
    
    # 构建请求数据
    payload = {
        "userid": userid,
        "codeid": codeid,
        "html": html
    }
    url = f"{BASE_URL}/api/submit-form-data"
    
    # 设置请求头，包含认证信息
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        logger.info(f"准备发送数据到接口: {url}, userid: {userid}, codeid: {codeid[:20]}...")
        print(f"准备发送数据到接口: {url}, userid: {userid}, codeid: {codeid}")
        
        # 发送POST请求
        response = requests.post(
            url,
            json=payload,
            timeout=timeout,
            headers=headers
        )
        
        logger.info(f"收到响应，状态码: {response.status_code}")
        
        # 检查响应状态码
        response.raise_for_status()
        
        # 尝试解析JSON响应
        try:
            result = response.json()
            logger.info(f"请求成功，响应数据: {result}")
            print(f"数据发送成功，userid: {userid}, codeid: {codeid}, 响应状态: {response.status_code}")
            
            # 显示结果摘要
            print(f"\n=== API调用结果摘要 ===")
            print(f"✅ 请求成功!")
            return result
        except json.JSONDecodeError:
            logger.warning(f"无法解析响应为JSON，原始响应: {response.text[:200]}...")
            print(f"响应解析错误，无法解析JSON数据, userid: {userid}, codeid: {codeid}")
            
            # 显示结果摘要
            print(f"\n=== API调用结果摘要 ===")
            print(f"❌ 请求失败: Invalid JSON response")
            return {"success": False, "error": "Invalid JSON response", "raw_response": response.text[:500]}
            
    except requests.exceptions.ConnectionError as e:
        logger.error(f"无法连接到服务器: {str(e)}")
        print(f"网络连接错误，无法连接到接口: {url}")
        
        # 显示结果摘要
        print(f"\n=== API调用结果摘要 ===")
        print(f"❌ 请求失败: Connection error")
        return {"success": False, "error": "Connection error", "details": str(e)}
    except requests.exceptions.Timeout as e:
        logger.error(f"请求超时: {str(e)}")
        print(f"请求超时，超过{timeout}秒，userid: {userid}, codeid: {codeid}")
        
        # 显示结果摘要
        print(f"\n=== API调用结果摘要 ===")
        print(f"❌ 请求失败: Request timeout")
        return {"success": False, "error": "Request timeout", "details": str(e)}
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        reason = e.response.reason
        logger.error(f"HTTP错误 {status_code}: {reason}")
        print(f"HTTP错误，状态码: {status_code}, 错误信息: {str(e)}, userid: {userid}, codeid: {codeid}")
        
        # 显示结果摘要
        print(f"\n=== API调用结果摘要 ===")
        try:
            # 尝试获取错误详情
            error_detail = e.response.json() if e.response.text else {}
            logger.error(f"错误详情: {error_detail}")
            error_msg = error_detail.get('error', f"HTTP error: {status_code}")
            print(f"❌ 请求失败: {error_msg}")
            return {"success": False, "error": error_msg, "details": error_detail}
        except Exception as json_error:
            logger.error(f"无法解析错误响应: {str(json_error)}")
            print(f"❌ 请求失败: HTTP error: {status_code}")
            return {"success": False, "error": f"HTTP error: {status_code}", "raw_response": e.response.text[:500]}
    except Exception as e:
        logger.error(f"发生未知错误: {str(e)}", exc_info=True)
        print(f"发送数据时发生未知错误: {str(e)}, userid: {userid}, codeid: {codeid}")
        
        # 显示结果摘要
        print(f"\n=== API调用结果摘要 ===")
        print(f"❌ 请求失败: Unknown error")
        return {"success": False, "error": f"Unknown error: {str(e)}"}
      
    return None

def query_html_content(
    userid: Union[int, str],
    query_keyword: str,
    timeout: int = 30,
    api_key: str = 'default_api_key'
) -> Optional[Dict[str, Any]]:
    """查询HTML内容，调用/query/html接口
    
    Args:
        userid: 用户ID，整数或字符串类型
        query_keyword: 查询关键字，作为codeid使用
        timeout: 请求超时时间，默认30秒
        api_key: API密钥，默认为'default_api_key'
        
    Returns:
        响应结果字典，如果请求失败返回包含错误信息的字典
    """
    # 验证参数
    if not userid:
        error_msg = "userid不能为空"
        logger.error(f"数据格式验证失败: {error_msg}")
        print(f"错误: {error_msg}")
        return {"success": False, "error": error_msg}
    
    if not query_keyword or not isinstance(query_keyword, str):
        error_msg = "query_keyword必须是非空字符串"
        logger.error(f"数据格式验证失败: {error_msg}")
        print(f"错误: {error_msg}")
        return {"success": False, "error": error_msg}
    
    # 构建查询URL和参数
    url = f"{BASE_URL}/query/html"
    params = {
        "userid": userid,
        "query_keyword": query_keyword
    }
    
    # 设置请求头，包含认证信息
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        logger.info(f"准备查询HTML内容: {url}, userid: {userid}, query_keyword: {query_keyword}")
        print(f"准备查询HTML内容: {url}, userid: {userid}, query_keyword: {query_keyword}")
        
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
            logger.info(f"查询成功，获取到HTML内容")
            print(f"查询成功，userid: {userid}, query_keyword: {query_keyword}, 响应状态: {response.status_code}")
            print(f"HTML内容长度: {len(result.get('html', ''))} 字符")
            
            # 显示结果摘要
            print(f"\n=== API调用结果摘要 ===")
            print(f"✅ 查询成功!")
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

def save_html_to_file(html_content: str, file_path: str) -> bool:
    """将HTML内容保存到文件
    
    Args:
        html_content: HTML内容字符串
        file_path: 文件路径
        
    Returns:
        bool: 保存是否成功
    """
    try:
        # 确保目录存在
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # 清空文件并写入新内容
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        logger.info(f"HTML内容已成功保存到文件: {file_path}")
        print(f"\n✅ HTML内容已成功保存到文件")
        print(f"文件路径: {file_path}")
        print(f"内容长度: {len(html_content)} 字符")
        return True
    except Exception as e:
        logger.error(f"保存HTML内容到文件时发生错误: {str(e)}", exc_info=True)
        print(f"\n❌ 保存HTML内容到文件失败: {str(e)}")
        return False

def get_input_params():
    """通过命令行输入获取参数
    
    Returns:
        tuple: (userid, codeid, html)
    """
    print("\n=== 请输入参数 ===")
    
    # 获取userid
    while True:
        userid_input = input("请输入userid: ").strip()
        if not userid_input:
            print("错误: userid不能为空")
            continue
        try:
            # 尝试转换为整数以验证
            int(userid_input)
            break
        except ValueError:
            print("错误: userid必须是整数或可以转换为整数的字符串")
    
    # 获取codeid
    while True:
        codeid = input("请输入codeid: ").strip()
        if codeid:
            break
        print("错误: codeid不能为空")
    
    # 获取html内容
    print("请输入html内容 (输入完成后，单独输入一行 'END' 结束输入):")
    html_lines = []
    while True:
        line = input()
        if line == 'END':
            break
        html_lines.append(line)
    html = '\n'.join(html_lines)
    
    if not html:
        print("警告: html内容为空")
    
    return userid_input, codeid, html

def display_menu():
    """显示主菜单"""
    print("\n" + "="*50)
    print("              后端API调用工具              ")
    print("="*50)
    print("1. 调用 /api/submit-form-data 路由 (提交HTML数据)")
    print("2. 调用 /query/html 路由 (查询HTML内容)")
    print("0. 退出")
    print("="*50)

def main():
    """主函数"""
    while True:
        display_menu()
        choice = input("请选择操作 (0-2): ").strip()
        
        if choice == '0':
            print("\n感谢使用，再见！")
            break
        
        elif choice == '1':
            print("\n您选择了: 调用 /api/submit-form-data 路由")
            
            # 获取输入方式
            input_method = input("\n请选择输入方式 (1: 手动输入参数, 2: 从JSON文件读取): ").strip()
            
            if input_method == '1':
                # 手动输入参数
                userid, codeid, html = get_input_params()
                result = send_ai_workflow_data(userid=userid, codeid=codeid, html=html)
            elif input_method == '2':
                # 从JSON文件读取
                json_path = input("请输入JSON文件路径 (直接回车使用默认路径 './1.json'): ").strip()
                if not json_path:
                    json_path = 'default'
                result = send_ai_workflow_data(json_file_path=json_path)
            else:
                print("无效的选择，请重新开始")
                continue
            
            # 显示结果
            if result and result.get('success') is not False:
                print("\n操作成功完成！")
            else:
                print("\n操作失败，请检查错误信息")
        
        elif choice == '2':
            print("\n您选择了: 调用 /query/html 路由")
            
            # 获取查询参数
            userid = input("请输入userid: ").strip()
            query_keyword = input("请输入query_keyword: ").strip()
            
            if not userid or not query_keyword:
                print("错误: userid和query_keyword不能为空")
                continue
            
            # 调用查询接口
            result = query_html_content(userid=userid, query_keyword=query_keyword)
            
            # 处理查询结果
            if result and 'html' in result:
                # 保存到文件
                file_path = os.path.join(os.path.dirname(__file__), '1.txt')
                save_success = save_html_to_file(result['html'], file_path)
                
                if save_success:
                    print("\n操作成功完成！")
                else:
                    print("\n查询成功，但保存文件失败")
            else:
                print("\n查询失败，请检查错误信息")
        
        else:
            print("无效的选择，请重新输入")
        
        # 等待用户按回车键继续
        input("\n按回车键继续...")

if __name__ == "__main__":
    main()
