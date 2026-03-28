const swaggerSpec = {
  openapi: '3.0.0',
  info: { title: 'hd API', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3005' }],
  paths: {
    '/api/submit-form-data': {
      post: {
        summary: 'Submit form data to database',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userid: { type: 'integer', description: 'User ID' },
                  codeid: { type: 'string', description: 'Code ID' },
                  html: { type: 'string', description: 'HTML content' },
                  code: { type: 'string', description: 'Additional code description', nullable: true }
                },
                required: ['userid', 'codeid', 'html']
              }
            }
          }
        },
        responses: {
          '201': { description: 'Form data submitted successfully' },
          '400': { description: 'Invalid request data' },
          '409': { description: 'Record already exists' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/5173/{userid}/{codeid}': {
      get: {
        summary: 'Get HTML content',
        parameters: [
          { in: 'path', name: 'userid', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'codeid', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Successfully retrieved HTML content' },
          '400': { description: 'Invalid parameters' },
          '404': { description: 'HTML content not found' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/data': {
      get: {
        parameters: [
            { in: 'query', name: 'query_keyword', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'limit', required: false, schema: { type: 'integer' } }
          ],
        responses: { '200': { description: 'ok' } }
      },
      post: {
        parameters: [
          { in: 'query', name: 'query_keyword', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { plan_data: { type: 'object' } }, required: ['plan_data'] } } }
        },
        responses: { '201': { description: 'created' } }
      }
    },
    '/api/data/{id}': {
      put: {
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'query_keyword', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { plan_data: { type: 'object' } }, required: ['plan_data'] } } }
        },
        responses: { '200': { description: 'ok' }, '404': { description: 'not found' } }
      },
      delete: {
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'query_keyword', required: true, schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'ok' }, '404': { description: 'not found' } }
      }
    },
    '/api/users/login': {
      post: {
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  phone: { type: 'string', description: 'User phone number' },
                  password: { type: 'string', description: 'User password' }
                },
                required: ['phone', 'password']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Login successful' },
          '400': { description: 'Invalid parameters' },
          '401': { description: 'Invalid phone or password' },
          '500': { description: 'Internal server error during login process' }
        }
      }
    },
    '/api/users/register': {
      post: {
        summary: '用户注册',
        description: '接收用户注册信息，验证并安全存储用户数据',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'password', 'name'],
                properties: {
                  phone: { 
                    type: 'string',
                    description: '手机号码，必须是有效的中国大陆手机号',
                    example: '13812345678'
                  },
                  password: { 
                    type: 'string',
                    description: '密码，长度在6-60个字符之间',
                    example: 'Password123'
                  },
                  name: { 
                    type: 'string',
                    description: '用户名，长度在1-50个字符之间',
                    example: 'John Doe'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: '用户注册成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        phone: { type: 'string' },
                        name: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: '请求参数错误或手机号已存在',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Phone number already registered' }
                  }
                }
              }
            }
          },
          '500': {
            description: '服务器内部错误',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Internal server error during user registration' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/data/encrypt': {
      post: {
        summary: '加密并存储行程数据',
        description: '接收JSON数据，进行SHA-256哈希加密，提取userid，将处理后数据存储到数据库',
        tags: ['Travel Plans'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userid'],
                properties: {
                  userid: {
                    type: 'integer',
                    description: '用户ID（必需，正整数）'
                  },
                  trip_title: {
                    type: 'string',
                    description: '行程标题'
                  },
                  days: {
                    type: 'array',
                    items: { type: 'object' }
                  },
                  trip_info: {
                    type: 'object'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: '数据加密并存储成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        query_keyword: { type: 'string' },
                        userid: { type: 'integer' },
                        created_at: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: '请求数据格式错误' },
          '500': { description: '服务器内部错误' }
        }
      }
    },
    '/api/data/user': {
      post: {
        summary: '根据用户ID查询行程计划',
        description: '接收userid参数，返回该用户的所有行程计划记录',
        tags: ['Travel Plans'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userid'],
                properties: {
                  userid: {
                    type: 'integer',
                    description: '用户ID（必需，正整数）',
                    example: 12345
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '查询成功，返回行程计划数组',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { type: 'object' }
                    },
                    count: { type: 'integer' },
                    response_time: { type: 'integer' }
                  }
                }
              }
            }
          },
          '400': { description: '请求参数错误' },
          '401': { description: '未授权访问' },
          '429': { description: '请求频率过高' },
          '500': { description: '服务器内部错误' },
          '503': { description: '数据库连接错误' }
        }
      }
    },
    '/api/ing-forms/query': {
      get: {
        summary: '查询ing表单数据',
        description: '根据user_id查询所有匹配的表单记录，支持分页',
        tags: ['Ing Forms'],
        parameters: [
          { in: 'query', name: 'user_id', required: true, schema: { type: 'integer' }, description: '用户ID' },
          { in: 'query', name: 'page', required: false, schema: { type: 'integer', default: 1 }, description: '页码，默认1' },
          { in: 'query', name: 'page_size', required: false, schema: { type: 'integer', default: 20 }, description: '每页记录数，默认20' }
        ],
        responses: {
          '200': {
            description: '查询成功，返回匹配的记录',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          json: { type: 'string' },
                          html: { type: 'string' },
                          codeid: { type: 'string' },
                          user_id: { type: 'integer' }
                        }
                      }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        current_page: { type: 'integer' },
                        page_size: { type: 'integer' },
                        total_items: { type: 'integer' },
                        total_pages: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: '参数错误' },
          '404': { description: '未找到匹配的记录' }
        }
      }
    },
    '/api/ing-forms/update-json': {
      post: {
        summary: '更新ing表单的JSON数据',
        description: '根据user_id和codeid查找记录，并更新其JSON字段',
        tags: ['Ing Forms'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user_id: { type: 'integer', required: true, description: '用户ID' },
                  codeid: { type: 'string', required: true, description: '表单唯一标识' },
                  json_data: { type: 'object', required: true, description: '要更新的JSON内容' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '更新成功，返回更新后的记录',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        json: { type: 'string' },
                        html: { type: 'string' },
                        codeid: { type: 'string' },
                        user_id: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: '参数错误' },
          '404': { description: '未找到匹配的记录' },
          '500': { description: '服务器内部错误' }
        }
      }
    },
    '/api/ing-forms/update-html': {
      post: {
        summary: '更新ing表单的HTML内容',
        description: '根据user_id和codeid查找记录，并更新其HTML字段',
        tags: ['Ing Forms'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user_id: { type: 'integer', required: true, description: '用户ID' },
                  codeid: { type: 'string', required: true, description: '表单唯一标识' },
                  html_content: { type: 'string', required: true, description: '要更新的HTML内容' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '更新成功，返回更新后的记录',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        json: { type: 'string' },
                        html: { type: 'string' },
                        codeid: { type: 'string' },
                        user_id: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: '参数错误' },
          '404': { description: '未找到匹配的记录' },
          '500': { description: '服务器内部错误' }
        }
      }
    },
    '/api/ing-forms/create': {
      post: {
        summary: '创建ing表单记录',
        description: '创建包含指定user_id和codeid的新记录',
        tags: ['Ing Forms'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user_id: { type: 'integer', required: true, description: '用户ID' },
                  codeid: { type: 'string', required: true, description: '表单唯一标识' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: '创建成功，返回新创建的记录',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        json: { type: 'string' },
                        html: { type: 'string' },
                        codeid: { type: 'string' },
                        user_id: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: '参数错误或记录已存在' },
          '500': { description: '服务器内部错误' }
        }
      }
    },
    '/api/user-info/query': {
      post: {
        summary: '根据userid查询用户搜索信息',
        description: '接收userid参数，返回该用户的所有搜索信息记录',
        tags: ['User Info'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userid'],
                properties: {
                  userid: {
                    type: 'integer',
                    description: '用户ID（必需，正整数）',
                    example: 12345
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '查询成功，返回匹配的记录',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          userid: { type: 'integer' },
                          query_keyword: { type: 'string' },
                          depart_time: { type: 'string' },
                          destination: { type: 'string' },
                          the_count: { type: 'string' },
                          budget: { type: 'string' }
                        }
                      }
                    },
                    count: { type: 'integer' }
                  }
                }
              }
            }
          },
          '400': { description: '参数错误：userid无效或缺失' },
          '500': { description: '服务器内部错误' },
          '503': { description: '数据库连接错误' }
        }
      }
    },
    '/api/user-info/insert': {
      post: {
        summary: '插入用户搜索信息',
        description: '向user_info表插入一条新的用户搜索信息记录',
        tags: ['User Info'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userid', 'query_keyword'],
                properties: {
                  userid: {
                    type: 'integer',
                    description: '用户ID（必需，正整数）',
                    example: 12345
                  },
                  query_keyword: {
                    type: 'string',
                    description: '搜索关键词（必需）',
                    example: '北京三日游'
                  },
                  depart_time: {
                    type: 'string',
                    description: '出发时间（可选）',
                    example: '2024-06-01'
                  },
                  destination: {
                    type: 'string',
                    description: '搜索目的地（可选）',
                    example: '北京'
                  },
                  the_count: {
                    type: 'string',
                    description: '出行人数（可选）',
                    example: '3人'
                  },
                  budget: {
                    type: 'string',
                    description: '预算金额（可选）',
                    example: '3000元'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: '插入成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        userid: { type: 'integer' },
                        query_keyword: { type: 'string' },
                        depart_time: { type: 'string' },
                        destination: { type: 'string' },
                        the_count: { type: 'string' },
                        budget: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: '参数错误：缺少必填参数或参数格式无效' },
          '409': { description: '记录已存在' },
          '500': { description: '服务器内部错误' },
          '503': { description: '数据库连接错误' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
