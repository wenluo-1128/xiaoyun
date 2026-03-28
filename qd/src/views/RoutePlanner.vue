<template>
  <div class="route-planner">
    <!-- 固定背景层（占满视口，不随内容滚动） -->
    <div class="hero-background">
      <div class="hero-pattern"></div>
    </div>
    <!-- 中文文字装饰层（静态展示，无交互） -->
    <div class="hero-text-decoration">
      <!-- 核心标语（所有屏幕都显示） -->
      <span class="text-decor text-left-large" style="--rotation: -6deg; top: 8%; left: 45%;">智绘旅程</span>
      <span class="text-decor text-left-large" style="--rotation: -5deg; top: 15%; left: 2%;">奔赴山海</span>
      <span class="text-decor text-right" style="--rotation: 15deg; top: 5%; right: 0%;">专属轨迹</span>
      <span class="text-decor text-left-large" style="--rotation: 3deg; top: 65%; left: 1%;">心之所向，步履皆往</span>
      
      <!-- 中等屏幕及以上显示（平板和桌面） -->
      <span class="text-decor text-left show-md-up" style="--rotation: 3deg; top: 5%; left: 25%;">算法知你心</span>
      <span class="text-decor text-right-small show-md-up" style="--rotation: -8deg; top: 12%; left: 5%;">精心设计</span>
      <span class="text-decor text-right show-md-up" style="--rotation: -10deg; top: 18%; right: 5%;">智能规划</span>
      <span class="text-decor text-left show-md-up" style="--rotation: 18deg; top: 40%; left: 45%;">不想做攻略？交给 AI</span>
      <span class="text-decor text-left-large show-md-up" style="--rotation: -12deg; top: 45%; left: 3%;">创意规划</span>
      <span class="text-decor text-right show-md-up" style="--rotation: 10deg; top: 42%; right: 2%;">独具匠心</span>
      <span class="text-decor text-right show-md-up" style="--rotation: -6deg; top: 50%; right: 15%;">定制化</span>
      <span class="text-decor text-right-small show-md-up" style="--rotation: 12deg; top: 28%; right: 3%;">比你更懂你的旅行搭子</span>
      <span class="text-decor text-right-small show-md-up" style="--rotation: -15deg; top: 62%; right: 4%;">不虚此行</span>
      <span class="text-decor text-left show-md-up" style="--rotation: 18deg; bottom: 80%; left: 0%;">出发就现在</span>
      
      <!-- 仅大屏幕显示（桌面） -->
      <span class="text-decor text-right-small show-lg-up" style="--rotation: 5deg; top: 5%; right: 18%;">定制未来，从点击开始</span>
      <span class="text-decor text-right-small show-lg-up" style="--rotation: 7deg; top: 60%; right: 6%;">一键生成你的梦中情旅</span>
      <span class="text-decor text-right-small show-lg-up" style="--rotation: 10deg; top: 75%; right: 5%;">定制每一程</span>
      <span class="text-decor text-right show-lg-up" style="--rotation: 5deg; bottom: 10%; right: 75%;">智绘旅程</span>
      <span class="text-decor text-left show-lg-up" style="--rotation: 10deg; bottom: 8%; left: 35%;">美食不踩雷</span>
      <span class="text-decor text-right-small show-lg-up" style="--rotation: -10deg; bottom: 5%; right: 25%;">排队不用愁</span>
      <span class="text-decor text-right show-lg-up" style="--rotation: 8deg; bottom: 55%; right: 75%;">景点个性推</span>
      <span class="text-decor text-left show-lg-up" style="--rotation: 6deg; bottom: 10%; left: 75%;">旅途更尽兴</span>
      <span class="text-decor text-right show-lg-up" style="--rotation: -11deg; top: 35%; right: 15%;">智能更懂你</span>
    </div>
    
    <div class="plan-container">
        <!-- 侧边区域 -->
      <div class="left">
        <!-- 地点列表控制面板 -->
        <div class=" glass-card panel" style="box-shadow: none;">
          <div class="panel-header">
            <span>📍 {{ attractionsData.trip_title }}</span>
          </div>
          <div class="day-selector">
            <!-- <div class="day-selector-title">选择旅游天数：</div> -->
            <div class="day-selector-trigger" @click="toggleDaySelector($event)" ref="daySelectorTrigger">
              <span class="current-selection">
                {{`第${selectedDay}天`}} | {{ attractionsData.days?.[selectedDay - 1]?.title || `第${selectedDay}天` }}
              </span>
              <span class="dropdown-arrow" :class="{ 'arrow-up': showDaySelector }">▼</span>
            </div>

            
            
            <!-- 弹出式选择列表 -->
            <div
              v-if="showDaySelector"
              class="day-selector-popup"
              @click.stop
            >
              <div class="day-selector-overlay" @click="closeDaySelector"></div>
              <div class="day-selector-list">
                <div
                  v-for="day in attractionsData.trip_info?.total_days || 3"
                  :key="day"
                  @click="onDayChange(day)"
                  class="day-option"
                  :class="{ 'day-option-active': selectedDay === day }"
                >
                  <span class="day-option-text">第{{ day }}天</span>
                  <span class="day-option-subtitle" v-if="attractionsData.days?.[day - 1]">
                    {{ attractionsData.days[day - 1].title }}
                  </span>
                  <span class="day-option-check" v-if="selectedDay === day">✓</span>
                </div>
              </div>
            </div>
          </div>

          <div class="stats stat-items">
              <span class="stat-item">📏距离：{{ distanceText }}</span>
                <span class="stat-item">⏱️预计：{{ durationText }}</span>
                <span class="stat-item">段数：{{ routeStats.segments?.length || 0 }}</span>
            </div>

          <div class="panel-content">
            <div
              v-for="(item, idx) in attractions"
              :key="item.id"
              class="panel-item"
              :class="{ 'panel-item-start': idx === 0, 'panel-item-end': idx === attractions.length - 1 }"
              @click="focusItem(idx)"
            >
              <div class="item-marker" :style="{ backgroundColor: markerColorByIndex(idx) }"></div>
              <div class="item-info">
                <div class="item-time">{{ item.time }}</div>
                <div class="item-name">{{ item.name }}</div>
              </div>
              <div class="item-actions">
                <!-- 移动按钮（起点和终点不能移动） -->
                <button
                  v-if="idx > 0 && idx < attractions.length - 1"
                  @click.stop="moveItemUp(idx)"
                  class="btn-move-up"
                  title="上移"
                >↑</button>
                <button
                  v-if="idx > 0 && idx < attractions.length - 2"
                  @click.stop="moveItemDown(idx)"
                  class="btn-move-down"
                  title="下移"
                >↓</button>
                <button
                  v-if="idx > 0"
                  @click.stop="removeItem(idx)"
                  class="btn-remove"
                  title="删除"
                >×</button>
              </div>
            </div>
          </div>

          <div class="panel-actions">
              <button @click="addNewItem" class="btn-add">+ 添加途径点</button>
            </div>

          <div class="actions1">
                <button @click="resetView" class="btn-primary">视野适配</button>
                <button @click="savePlanData" class="btn-secondary">保存路线</button>
                <!-- <button @click="loadRoute" class="btn-secondary">加载路线</button> -->
                <button @click="clearRoute" class="btn-danger">清除路线</button>
            </div>
        </div>

         <!-- 进入网页浏览旅行计划按钮 -->
            <router-link
              :to="`/travel-plan-view/${getGlobalParam('userid', '23')}/${getGlobalParam('query_keyword', 'abc')}`"
              class="travel-plan-link"
              @click="handleViewTravelPlan"
            >查看完整旅行计划</router-link>
      </div>
      <!-- 地图显示 -->
      <div class="right">
        <!-- 地图容器 -->
        <div id="container"></div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, provide } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import localAttractions from "../data/1.json";
const attractionsData = reactive(localAttractions);

// 全局状态对象
const globalState = reactive({
  // 存储从 URL 参数解析的参数
  urlParams: {},
  
  // 其他全局状态
  appConfig: {
    isInitialized: false
  },
  
  // 数据源状态
  dataSource: {
    isUsingLocalData: false, // 是否正在使用本地数据
    lastFetchTime: null, // 上次成功获取数据的时间
    fetchAttempts: 0 // 获取尝试次数
  }
});

// 解析URL参数的函数
function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  
  // 处理query_keyword参数
  if (urlParams.has('query_keyword')) {
    try {
      // 尝试解析JSON格式的值
      params.query_keyword = JSON.parse(urlParams.get('query_keyword'));
    } catch {
      // 如果不是JSON，就使用原始字符串值
      params.query_keyword = urlParams.get('query_keyword');
    }
  }

  //qv获取userid参数
//   if (urlParams.has('userid')) {
//     params.userid = urlParams.get('userid');
//   }
    try {
      // 获取localStorage中的数据
      const userStr = localStorage.getItem('user');
      if (userStr) {
        // 解析JSON字符串为JavaScript对象
        const userObj = JSON.parse(userStr);
        // 提取id（根据实际数据结构获取）
        params.userid = userObj.data?.id;
      }
    } catch (e) {
      console.error('解析用户数据失败:', e);
    }

  
  // 更新全局状态
  globalState.urlParams = { ...globalState.urlParams, ...params };
  console.log('解析到的URL参数:', params);
  
  return params;
}

// 提供获取参数的方法
function getGlobalParam(key, defaultValue = null) {
  return globalState.urlParams[key] !== undefined ? globalState.urlParams[key] : defaultValue;
}

// 提供设置参数的方法
function setGlobalParam(key, value) {
  globalState.urlParams[key] = value;
}

// 为组件提供全局状态访问
provide('globalState', globalState);
provide('getGlobalParam', getGlobalParam);
provide('setGlobalParam', setGlobalParam);

const map = ref(null);
const AMapRef = ref(null);
const markers = ref([]);
const infoWindow = ref(null);
const driving = ref(null);
const mainPolyline = ref(null);
const altPolylines = ref([]);
const loading = ref(false);
const progress = ref(0);
const routeStats = reactive({ 
  distance: 0, 
  duration: 0,
  segments: [], // 新增：分段统计信息
  totalStayTime: 0 // 新增：总停留时间
});

const segmentPolylines = ref([]);
const segmentColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];
const styleMain = reactive({ color: "#3b82f6", weight: 5, opacity: 0.9 });
const styleAlt = reactive({ color: "#9ca3af", weight: 3, opacity: 0.7 });

const avoidPolygons = ref([]);
const isDragging = ref(false);
// 新的数据结构支持 - 三天行程
const selectedDay = ref(1); // 默认选择第一天
const attractions = ref([]); // 当前选中天的景点数据
const showDaySelector = ref(false); // 天数选择器弹出状态
const error = ref(null);
const debouncedReplan = debounce(() => planMultiSegmentDriving(), 500);

// 防抖函数实现
function debounce(fn, delay) {
  let timer = null;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

// 本地数据加载函数（非阻塞主线程）
async function loadLocalData() {
  return new Promise((resolve) => {
    // 使用 setTimeout 将任务推送到宏任务队列，避免阻塞主线程
    setTimeout(() => {
      try {
        // 导入本地 JSON 数据
        const localData = JSON.parse(JSON.stringify(localAttractions));
        
        if (Array.isArray(localData) && localData.length > 0 && localData[0].plan_data) {
          resolve({
            success: true,
            data: localData[0].plan_data,
            source: 'local'
          });
        } else {
          resolve({
            success: false,
            error: '本地数据格式不正确',
            source: 'local'
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: `本地数据加载失败：${error.message}`,
          source: 'local'
        });
      }
    }, 0);
  });
}

// 显示数据源提示
function showDataSourceToast(isUsingLocal) {
  if (globalState.showToast) {
    if (isUsingLocal) {
      globalState.showToast('网络异常，已自动切换到本地缓存数据', 'warning');
    } else {
      globalState.showToast('数据加载成功', 'success');
    }
  } else {
    // 如果没有全局 toast，使用 error ref 显示
    if (isUsingLocal) {
      error.value = '⚠️ 网络异常，正在使用本地缓存数据';
      setTimeout(() => {
        if (error.value === '⚠️ 网络异常，正在使用本地缓存数据') {
          error.value = null;
        }
      }, 5000);
    }
  }
}

async function savePlanData() {
  // 更新当前天的景点数据到 attractionsData
  if (attractions.value.length > 0 && selectedDay.value > 0) {
    const dayIndex = selectedDay.value - 1;
    if (attractionsData.days && attractionsData.days[dayIndex]) {
      // 重新计算所有天的景点 id，确保连续递增从 1 开始
      let currentId = 1;
      
      // 先更新前面所有天的 id
      for (let i = 0; i < dayIndex; i++) {
        const day = attractionsData.days[i];
        if (day && day.attractions) {
          day.attractions = day.attractions.map(attraction => ({
            ...attraction,
            id: currentId++
          }));
        }
      }
      
      // 更新当前天的 id
      const updatedAttractions = attractions.value.map(attraction => ({
        ...attraction,
        id: currentId++
      }));
      attractionsData.days[dayIndex].attractions = updatedAttractions;
      
      // 更新后面所有天的 id
      for (let i = dayIndex + 1; i < attractionsData.days.length; i++) {
        const day = attractionsData.days[i];
        if (day && day.attractions) {
          day.attractions = day.attractions.map(attraction => ({
            ...attraction,
            id: currentId++
          }));
        }
      }
    }
  }

  // 构建计划数据，只包含必要的字段
  const plan = {
    trip_title: attractionsData.trip_title || '',
    days: (attractionsData.days || []).map(day => ({
      day: day.day,
      title: day.title,
      attractions: (day.attractions || []).map(attraction => ({
        id: attraction.id,
        name: attraction.name,
        time: attraction.time || '',
        lnglat: attraction.lnglat || [],
        desc: attraction.desc || ''
      }))
    })),
    trip_info: attractionsData.trip_info || {}
  };

  const queryKeyword = getGlobalParam('query_keyword', 'ee722416ca16e1422c503c33c355563e99b68748a748ac1649');
  const url = new URL(`http://${import.meta.env.VITE_IP}:3005/api/data`);

  const saveController = new AbortController();
  const saveTimeoutId = setTimeout(() => saveController.abort(), 15000);

  logMessage('info', '开始保存计划数据到服务器');
  
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query_keyword: queryKeyword,
        plan_data: plan
      }),
      signal: saveController.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP 错误！状态码：${response.status}`);
    }

    const result = await response.json();
    clearTimeout(saveTimeoutId);
    
    // 使用收到的最新数据
    if (result.plan_data) {
      attractionsData.trip_title = result.plan_data.trip_title || '';
      attractionsData.days = result.plan_data.days || [];
      attractionsData.trip_info = result.plan_data.trip_info || {};
      
      // 更新当前天的景点数据
      loadDayAttractions(selectedDay.value);
      createMarkers();
      await planMultiSegmentDriving();
    }
    
    logMessage('info', '计划数据保存成功', { planId: result.id });
    return result;
  } catch (error) {
    clearTimeout(saveTimeoutId);
    logMessage('error', '保存计划数据失败', { error: error.message });
    throw error;
  }
}

function checkAndFillLnglat(planData) {
  if (!planData || !planData.days) return;
  
  planData.days.forEach(day => {
    const attractions = day.attractions;
    if (!attractions) return;
    
    attractions.forEach((attraction, index) => {
      if (!attraction.lnglat || attraction.lnglat.length === 0) {
        let nearbyLnglat = [];
        for (let i = index - 1; i >= 0; i--) {
          if (attractions[i].lnglat && attractions[i].lnglat.length > 0) {
            nearbyLnglat = attractions[i].lnglat;
            break;
          }
        }
        if (nearbyLnglat.length === 0) {
          for (let i = index + 1; i < attractions.length; i++) {
            if (attractions[i].lnglat && attractions[i].lnglat.length > 0) {
              nearbyLnglat = attractions[i].lnglat;
              break;
            }
          }
        }
        if (nearbyLnglat.length > 0) {
          const offset = 0.001;
          const randomLng = nearbyLnglat[0] + (Math.random() * 2 - 1) * offset;
          const randomLat = nearbyLnglat[1] + (Math.random() * 2 - 1) * offset;
          attraction.lnglat = [randomLng, randomLat];
        }
      }
    });
  });
}

async function saveRouteRemote(){
  try {
    logMessage('info', '开始执行saveRouteRemote方法，获取用户认证和地图数据');
    
    // 获取用户认证信息
    const userId = getGlobalParam('userid', '');
    const queryKeyword = getGlobalParam('query_keyword', 'ee722416ca16e1422c503c33c355563e99b68748a748ac1649');
    
    logMessage('debug', '获取到的参数', { userId, queryKeyword });
    
    // 构建包含用户认证信息的URL
    const url = new URL(`http://${import.meta.env.VITE_IP}:3005/api/data`);
    url.searchParams.append('query_keyword', queryKeyword);
    
    // 只有当userId存在时才添加到请求参数中
    if (userId) {
      url.searchParams.append('userid', userId);
      logMessage('info', '用户认证信息已添加', { userId });
    } else {
      logMessage('warn', '未提供用户ID，将以匿名方式访问');
    }
    
    // 获取地图初始数据
    logMessage('info', '开始获取地图初始数据', { url: url.toString() });
    
    // 添加请求超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 秒超时
    
    let response;
    try {
      response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // 重新抛出错误，由外层 catch 处理
    }
    
    clearTimeout(timeoutId);
    
    // 检查响应状态
    if (!response.ok) {
      const statusCode = response.status;
      logMessage('error', `HTTP 错误！状态码：${statusCode}`);
      
      // 针对不同状态码的分类处理
      if (statusCode >= 500) {
        throw new Error(`服务器错误 (${statusCode})`);
      } else if (statusCode === 404) {
        throw new Error('资源未找到 (404)');
      } else if (statusCode === 403) {
        throw new Error('无访问权限 (403)');
      } else {
        throw new Error(`HTTP 错误！状态码：${statusCode}`);
      }
    }
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`JSON 解析失败：${parseError.message}`);
    }
    logMessage('debug', '获取到的数据', { dataLength: Array.isArray(data) ? data.length : '非数组' });
    
    // 检查数据有效性并更新地图
    if (Array.isArray(data) && data.length > 0 && data[0].plan_data) {
      const planData = data[0].plan_data;
      logMessage('info', '成功获取地图数据，准备更新地图');
      
      // 更新地图数据
      attractionsData.trip_title = planData.trip_title || '';
      attractionsData.days = planData.days || [];
      attractionsData.trip_info = planData.trip_info || {};
      
      // 检查并补充空的经纬度数据
      logMessage('info', '开始检查并补充经纬度数据');
      checkAndFillLnglat(attractionsData);
      logMessage('info', '经纬度数据检查补充完成');
      
      // 更新数据源状态
      globalState.dataSource.isUsingLocalData = false;
      globalState.dataSource.lastFetchTime = Date.now();
      
      logMessage('debug', '地图数据更新完成', {
        hasTripTitle: !!planData.trip_title,
        daysCount: planData.days?.length || 0
      });
      
      try {
        // 自动渲染地图数据
        logMessage('info', '开始渲染地图数据');
        createMarkers();
        await planMultiSegmentDriving();
        logMessage('info', '地图数据渲染完成');
      } catch (renderError) {
        handleError(renderError, '地图渲染');
      }
      
      // 显示成功提示
      showDataSourceToast(false);
      
    } else {
      logMessage('warn', '未获取到有效的地图数据', { data });
      // 数据格式不正确，使用本地数据
      throw new Error('数据格式不正确');
    }

    // await savePlanData();

    return true;
    
  } catch (error) {
    // 详细的错误分类处理
    let errorType = 'unknown';
    let errorMessage = '';
    
    if (error.name === 'AbortError') {
      errorType = 'timeout';
      errorMessage = '请求超时，操作已取消';
      logMessage('error', errorMessage);
    } else if (error instanceof TypeError) {
      errorType = 'network';
      errorMessage = '网络连接失败，请检查网络设置';
      logMessage('error', `网络错误：${error.message}`);
    } else if (error.message?.includes('HTTP 错误')) {
      errorType = 'http';
      errorMessage = error.message;
      logMessage('error', errorMessage);
    } else if (error.message?.includes('JSON 解析')) {
      errorType = 'parse';
      errorMessage = '数据格式错误';
      logMessage('error', errorMessage);
    } else if (error.message?.includes('数据格式不正确')) {
      errorType = 'data';
      errorMessage = '服务器返回数据格式不正确';
      logMessage('error', errorMessage);
    } else {
      errorType = 'unknown';
      errorMessage = `未知错误：${error.message || '无详细信息'}`;
      logMessage('error', errorMessage, { error });
    }
    
    // 使用本地数据作为备用
    logMessage('warn', '网络请求失败，尝试使用本地缓存数据');
    
    // 异步加载本地数据（不阻塞主线程）
    const localDataResult = await loadLocalData();
    
    if (localDataResult.success) {
      const planData = localDataResult.data;
      
      // 更新地图数据
      attractionsData.trip_title = planData.trip_title || '';
      attractionsData.days = planData.days || [];
      attractionsData.trip_info = planData.trip_info || {};
      
      // 更新数据源状态
      globalState.dataSource.isUsingLocalData = true;
      globalState.dataSource.lastFetchTime = Date.now();
      
      logMessage('info', '本地数据加载成功，已更新地图');
      
      try {
        // 渲染地图数据
        createMarkers();
        await planMultiSegmentDriving();
        logMessage('info', '本地数据渲染完成');
      } catch (renderError) {
        handleError(renderError, '本地数据地图渲染');
      }
      
      // 显示本地数据提示
      showDataSourceToast(true);
      
    } else {
      logMessage('error', '本地数据加载也失败', { error: localDataResult.error });
      
      // 如果本地数据也失败，显示错误提示
      if (globalState.showToast) {
        globalState.showToast(`数据加载失败：${errorMessage}`, 'error');
      } else {
        error.value = errorMessage;
        setTimeout(() => {
          if (error.value === errorMessage) {
            error.value = null;
          }
        }, 5000);
      }
    }
    
    return false; // 失败返回
  }
}

// 获取指定天的景点数据
function loadDayAttractions(day) {
  if (!attractionsData.days || day < 1 || day > attractionsData.days.length) {
    attractions.value = [];
    return;
  }
  
  const dayData = attractionsData.days[day - 1];
  if (!dayData || !dayData.attractions) {
    attractions.value = [];
    return;
  }
  
  // 初始化景点数据，为每个景点添加dragHistory属性
  const dayAttractions = [...dayData.attractions]
    .sort((a, b) => (a.time > b.time ? 1 : -1))
    .map(item => ({
      ...item,
      dragHistory: [], // 拖拽历史记录
      day: day, // 标记属于第几天
      dayTitle: dayData.title // 标记天数标题
    }));
  
  attractions.value = dayAttractions;
}

// 初始化默认数据
loadDayAttractions(selectedDay.value);

// 监听天数变化
  function onDayChange(day) {
    selectedDay.value = day;
    loadDayAttractions(day);
    showDaySelector.value = false; // 选择天后关闭弹出列表
    // 清除现有的地图标记和路线
    clearMapData();
    // 重新创建标记点
    createMarkers();
    // 重新规划路线
    setTimeout(() => planMultiSegmentDriving(), 100);
  }

  function toggleDaySelector(event) {
    event?.stopPropagation(); // 阻止事件冒泡
    showDaySelector.value = !showDaySelector.value;
  }

  function closeDaySelector() {
    showDaySelector.value = false;
  }

  // 清除地图数据
  function clearMapData() {
    if (markers.value.length > 0) {
      map.value.remove(markers.value);
      markers.value = [];
    }
    clearSegmentRoutes();
    if (mainPolyline.value) {
      mainPolyline.value.setMap(null);
      mainPolyline.value = null;
    }
    routeStats.distance = 0;
    routeStats.duration = 0;
    routeStats.segments = [];
    routeStats.totalStayTime = 0;
  }

const distanceText = computed(() => {
  const km = routeStats.distance / 1000;
  return km.toFixed(2) + " km";
});
const durationText = computed(() => {
  const t = routeStats.duration;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  if (h) return `${h}小时${m}分`;
  if (m) return `${m}分${s}秒`;
  return `${s}秒`;
});
const formatStayTime = (minutes) => {
  if (minutes < 60) {
    return `${Math.round(minutes)}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}小时${remainingMinutes}分钟`;
};

function setSecurity() {
  window._AMapSecurityConfig = { securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE };
}

async function loadAMap() {
  setSecurity();
  const AMap = await AMapLoader.load({ 
    key: import.meta.env.VITE_AMAP_KEY || "", 
    version: "2.0", 
    plugins:["AMap.Driving","AMap.InfoWindow","AMap.Geocoder","AMap.PlaceSearch"]
  });
  AMapRef.value = AMap;
  map.value = new AMap.Map("container", { 
    viewMode: "3D", 
    resizeEnable: true, 
    center: [116.65, 23.66], 
    zoom: 15, 
    minZoom:12, 
    maxZoom:18,
    features: ['bg', 'road', 'building', 'point'],
    showLabel: true,
    // animateEnable:false
  });
  
  // 添加窗口大小改变事件监听，确保全屏布局
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  // 确保地图容器完全填充视窗
  const container = document.getElementById('container');
  if (container) {
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
  }
  // 重新调整地图大小
  if (map.value) {
    map.value.resize();
  }
}

function markerColorByIndex(i){ if(i===0) return "#10b981"; if(i===attractions.value.length-1) return "#ef4444"; return "#3b82f6"; }

function createMarkers() {
  const AMap = AMapRef.value;
  infoWindow.value = new AMap.InfoWindow({ 
    offset: new AMap.Pixel(0, -30),
    isCustom: true,
    content: '<div></div>'
  });
  
  // 清理旧标记点
  if (markers.value.length > 0) {
    map.value.remove(markers.value);
  }
  
  markers.value = attractions.value.map((item, idx) => {
    const content = `<div style="transform:translate(-50%,-100%);background:${markerColorByIndex(idx)};width:16px;height:16px;border-radius:50%;box-shadow:0 0 0 2px #fff"></div>`;
    const marker = new AMap.Marker({ 
      position: item.lnglat, 
      title: item.name, 
      draggable: true, 
      content,
      // 设置光标样式，提示可拖拽
      cursor: 'pointer',
      autoMove: false
    });
    
    // 记录拖拽开始位置
    let dragStartPos = null;
    
    // 点击事件 - 显示信息窗体
    marker.on("click", () => {
      const lng = item.lnglat[0].toFixed(6);
      const lat = item.lnglat[1].toFixed(6);
      const displayName = item.address || item.name || '未知地点';
      
      const html = `
        <div class="info-window" style="
          min-width:280px; 
          padding:4px;
          background:#FFFFFF !important;
          opacity:1 !important;
          box-shadow:none !important;
          border:none !important;
          border-radius:0 !important;
        ">
          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:8px;">
            <strong>【时间】</strong>${item.time}
          </div>
          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:8px;">
            <strong>【地点名称】</strong>${displayName}
          </div>
          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:8px;">
            <strong>【坐标】</strong>${lng}, ${lat}
          </div>
          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:8px;">
            <strong>【描述】</strong>${item.desc || '（已清除）'}
          </div>
          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:8px;">
            <strong>【地址】</strong>${item.address || '（已清除）'}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button onclick="window.startNavigation('${item.lnglat[0]}','${item.lnglat[1]}','${displayName}')" 
                    style="flex:1;padding:6px 12px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">
              📍 导航
            </button>
            <button onclick="document.querySelectorAll('.info-window').forEach(el => el.style.display='none')" 
                    style="padding:6px 12px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:4px;cursor:pointer;font-size:12px;">
              关闭
            </button>
          </div>
        </div>
      `;
      infoWindow.value.setContent(html);
      infoWindow.value.open(map.value, item.lnglat);
    });
    
    // 拖拽开始事件 - 记录起始位置
    marker.on("dragstart", () => {
      dragStartPos = marker.getPosition();
      isDragging.value = true;
      // 视觉反馈：标记点变为橙色，提示正在拖拽
      if (!marker.hasLabel()) {
        marker.setLabel({
          content: '🖐️ 拖拽中...',
          offset: new AMap.Pixel(0, -30),
          style: {
            backgroundColor: '#f97316',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        });
      }
    });
    
    // 拖拽结束事件 - 检测是否为有效拖拽
    marker.on("dragend", (e) => {
      const newLnglat = [e.lnglat.lng, e.lnglat.lat];
      
      // 清除拖拽状态提示
      if (marker.getLabel()) {
        marker.setLabel();
      }
      
      // 计算移动距离（使用简单的欧几里得距离）
      if (dragStartPos) {
        const startLng = dragStartPos.lng;
        const startLat = dragStartPos.lat;
        const endLng = e.lnglat.lng;
        const endLat = e.lnglat.lat;
        
        // 计算坐标差值（转换为米，纬度 1 度≈111km，经度 1 度≈111km*cos(纬度)）
        const latDiff = Math.abs(endLat - startLat) * 111000;
        const lngDiff = Math.abs(endLng - startLng) * 111000 * Math.cos(startLat * Math.PI / 180);
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        
        console.log(`标记点 ${idx} 拖拽距离：${distance.toFixed(2)}米`);
        
        // 只有移动距离超过 5 米才视为有效拖拽（避免误触）
        const MIN_DRAG_DISTANCE = 5; // 5 米阈值
        
        if (distance < MIN_DRAG_DISTANCE) {
          console.log(`移动距离过小 (${distance.toFixed(2)}m < ${MIN_DRAG_DISTANCE}m)，忽略此次拖拽`);
          // 移动距离过小，视为误触，不更新位置
          return;
        }
      }
      
      // 有效拖拽，执行位置更新
      onMarkerDragEnd(idx, marker, newLnglat);
    });
    
    return marker;
  });
  
  map.value.add(markers.value);
}

function setCache(key, data){ localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); }

// 多段式路线规划核心算法
async function planMultiSegmentDriving(){
  const points = attractions.value;
  
  // 防御性检查：如果只有一个点或没有点，不进行路线规划
  if (points.length < 2) {
    console.log('地点数量不足，跳过路线规划');
    clearSegmentRoutes();
    routeStats.distance = 0;
    routeStats.duration = 0;
    routeStats.segments = [];
    routeStats.totalStayTime = 0;
    fitView();
    return;
  }
  
  // 计算总停留时间
  routeStats.totalStayTime = points.reduce((total, point) => total + (point.stayTime || 30), 0);
  
  // 清除之前的分段路线
  clearSegmentRoutes();
  
  // 如果只有两个点（起点和终点），使用单段规划
  if (points.length === 2) {
    fitView();
    return await planSingleSegmentDriving(points[0].lnglat, points[1].lnglat);
  }
  
  loading.value = true;
  progress.value = 10;
  
  // 构建分段规划任务
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const segment = {
      start: points[i],
      end: points[i + 1],
      index: i,
      color: segmentColors[i % segmentColors.length]
    };
    segments.push(segment);
  }
  
  progress.value = 30;
  
  try {
    // 并行规划多个分段（最多3个并发）
    const segmentPromises = segments.map(segment => planSingleSegment(segment));
    const segmentResults = await Promise.all(segmentPromises);
    
    progress.value = 80;
    
    // 合并分段结果
    const mergedResult = mergeSegmentResults(segments, segmentResults);
    
    // 渲染分段路线
    renderSegmentRoutes(segments, segmentResults);
    
    // 更新统计信息
    updateSegmentStats(mergedResult);
    
    progress.value = 100;
    loading.value = false;
    
    return mergedResult;
    
  } catch (err) {
    console.error('多段式路线规划失败:', err);
    error.value = "多段式路线规划失败";
    loading.value = false;
    setTimeout(() => error.value = null, 3000);
  }
}

// 单段路线规划函数
function planSingleSegmentDriving(startLngLat, endLngLat) {
  return new Promise((resolve, reject) => {
    const AMap = AMapRef.value;
    
    if (!driving.value) {
      driving.value = new AMap.Driving({ 
        policy: AMap.DrivingPolicy.REAL_TRAFFIC, 
        map: map.value, 
        hideMarkers: true,
        autoFitView: false
      });
    }
    
    driving.value.search(startLngLat, endLngLat, (status, result) => {
      if (status === "complete" && result?.routes?.length) {
        const route = result.routes[0];
        resolve({
          path: route.steps.flatMap(s => s.path),
          distance: route.distance || 0,
          duration: route.time || 0,
          steps: route.steps || []
        });
      } else {
        reject(new Error(`单段规划失败: ${result?.info || '未知错误'}`));
      }
    });
  });
}
// 规划单个分段
async function planSingleSegment(segment) {
  const result = await planSingleSegmentDriving(segment.start.lnglat, segment.end.lnglat);
  return {
    ...result,
    startName: segment.start.name,
    endName: segment.end.name,
    segmentIndex: segment.index,
    color: segment.color
  };
}

// 合并分段结果
function mergeSegmentResults(segments, results) {
  let totalDistance = 0;
  let totalDuration = 0;
  const allPaths = [];
  const segmentInfos = [];
  
  results.forEach((result, index) => {
    totalDistance += result.distance;
    totalDuration += result.duration;
    
    // 合并路径（避免重复点）
    if (index === 0) {
      allPaths.push(...result.path);
    } else {
      // 去除第一个点，避免重复
      allPaths.push(...result.path.slice(1));
    }
    
    segmentInfos.push({
      index: index + 1,
      startName: result.startName,
      endName: result.endName,
      distance: result.distance,
      duration: result.duration,
      stayTime: segments[index].start.stayTime || 30,
      color: result.color
    });
  });
  
  return {
    mainPath: allPaths,
    totalDistance,
    totalDuration,
    segments: segmentInfos,
    totalStayTime: routeStats.totalStayTime
  };
}

// 渲染分段路线
function renderSegmentRoutes(segments, results) {
  const AMap = AMapRef.value;
  
  // 清除之前的分段路线
  clearSegmentRoutes();
  
  results.forEach((result, index) => {
    const polyline = new AMap.Polyline({
      map: map.value,
      path: result.path,
      strokeColor: segments[index].color,
      strokeWeight: 6,
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    });
    
    segmentPolylines.value.push(polyline);
  });
}

// 清除分段路线
function clearSegmentRoutes() {
  console.log('清除前的折线数组:', segmentPolylines.value);
  console.log('折线数量:', segmentPolylines.value.length);
  
  segmentPolylines.value.forEach(polyline => {
    polyline.setMap(null);
  });
  segmentPolylines.value = [];

  console.log('清除后的折线数组:', segmentPolylines.value);
  console.log('折线数量:', segmentPolylines.value.length);
}

// 更新分段统计信息
function updateSegmentStats(result) {
  routeStats.distance = result.totalDistance;
  routeStats.duration = result.totalDuration + result.totalStayTime * 60; // 停留时间转换为秒
  routeStats.segments = result.segments;
  routeStats.totalStayTime = result.totalStayTime;
  
  // 缓存结果
  const key = cacheKey(attractions.value.map(a => a.lnglat));
  setCache(key, result);
  
  // 仅在非拖拽操作时调用 fitView()
  console.log(isDragging.value);
  if (!isDragging.value) {
    fitView();
  }
  // 重置拖拽标志
    isDragging.value = false;
}

// 缓存相关函数更新
function cacheKey(points){
  const opts = { policy: "REAL_TRAFFIC", ferry: 0, avoid: avoidPolygons.value, segmented: true };
  return `amap_v2_seg:${btoa(unescape(encodeURIComponent(JSON.stringify({ points, opts })))).slice(0,64)}`;
}

function fitView(){
  console.log('fitView111111');
  const overlays = [ ...markers.value ];
  if(mainPolyline.value) overlays.push(mainPolyline.value);
  map.value.setFitView(overlays);
  const z = map.value.getZoom();
  if(z<1) map.value.setZoom(1);
  if(z>18) map.value.setZoom(18);
}



// 处理标记点拖拽结束事件
function onMarkerDragEnd(idx, marker, lnglat) {
  console.log(`标记点 ${idx} 拖拽到新位置:`, lnglat);
  
  // 设置加载状态提示
  if (!marker.hasLabel()) {
    marker.setLabel({
      content: `正在获取地点信息...`,
      offset: new AMapRef.value.Pixel(0, -30),
      style: {
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        border: 'none'
      }
    });
  }
  
  // 更新位置到景点数据中
  attractions.value[idx].lnglat = [...lnglat];
  attractions.value[idx].lastDragPosition = [...lnglat];
  
  // 调用新的完整位置处理函数
  getGeocodedLocation(lnglat).then(result => {
    
    // 清除加载状态
    setTimeout(() => {
      if (marker && marker.getLabel()) {
        marker.setLabel();
      }
    }, 100);
    
    if (result.success) {
      // 如果是POI搜索修正的位置，需要调整标记点位置
      if (result.method === 'poi_search' && result.data.correctedLnglat) {
        console.log('POI搜索修正位置:', result.data);
        
        // 记录修正信息
        const correctionInfo = `位置已修正：${result.data.distance}m`;
        attractions.value[idx].dragHistory.push({
          name: result.data.name,
          address: result.data.address,
          originalLnglat: result.data.originalLnglat,
          correctedLnglat: result.data.correctedLnglat,
          correctionDistance: result.data.distance,
          method: 'POI搜索',
          timestamp: Date.now()
        });
        
        // 移动标记点到修正位置
        marker.setPosition(result.data.correctedLnglat);
        attractions.value[idx].lnglat = [...result.data.correctedLnglat];
        
        // 显示修正状态
        if (!marker.hasLabel()) {
          marker.setLabel({
            content: `修正位置 - ${result.data.name}`,
            offset: new AMapRef.value.Pixel(0, -30),
            style: {
              backgroundColor: '#10b981',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              border: 'none'
            }
          });
        }
        
        // 更新数据
        attractions.value[idx].name = result.data.name;
        attractions.value[idx].address = result.data.address;
        
      } else {
        // 地理编码成功的情况
        attractions.value[idx].name = result.data.name;
        attractions.value[idx].address = result.data.address;
        
        // 记录地理编码历史
        attractions.value[idx].dragHistory.push({
          name: result.data.name,
          address: result.data.address,
          lnglat: [...lnglat],
          method: '地理编码',
          timestamp: Date.now()
        });
      }
      
      // 限制历史记录数量
      if (attractions.value[idx].dragHistory.length > 5) {
        attractions.value[idx].dragHistory.shift();
      }
      
    } else {
      // 所有定位方法都失败的情况
      attractions.value[idx].name = '精确定位失败';
      attractions.value[idx].address = '';
      attractions.value[idx].dragHistory.push({
        name: '精确定位失败',
        address: '',
        lnglat: [...lnglat],
        method: '失败',
        error: result.error,
        timestamp: Date.now()
      });
      
      // 显示错误状态
      if (!marker.hasLabel()) {
        marker.setLabel({
          content: `精确定位失败`,
          offset: new AMapRef.value.Pixel(0, -30),
          style: {
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            border: 'none'
          }
        });
      }
    }
    
    // 更新信息窗体内容
    updateInfoWindowAfterDrag(idx, lnglat, result);
    
    // 更新到 attractionsData
    if (selectedDay.value > 0) {
      const dayIndex = selectedDay.value - 1;
      if (attractionsData.days && attractionsData.days[dayIndex]) {
        attractionsData.days[dayIndex].attractions = [...attractions.value];
      }
    }
    
    // 触发重新规划
    debouncedReplan(); 
    
    // 更新信息窗口内容（如果打开）
    setTimeout(() => {
      if (marker && infoWindow.value && infoWindow.value.getAnchor() === marker) {
        // 重新打开信息窗口以显示更新的内容
        marker.emit('click', { lnglat: { lng: lnglat[0], lat: lnglat[1] } });
      }
    }, 100);
    
    // 5秒后清除状态提示
    setTimeout(() => {
      if (marker && marker.getLabel()) {
        marker.setLabel();
      }
    }, 5000);
    
    // 重置拖拽标志
    // isDragging.value = false;
  }).catch(error => {
    console.error('地理位置处理失败:', error);
    
    // 地理编码失败时显示错误状态
    if (marker && !marker.hasLabel()) {
      marker.setLabel({
        content: `处理失败`,
        offset: new AMapRef.value.Pixel(0, -30),
        style: {
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          border: 'none'
        }
      });
      
      // 5秒后清除错误状态
      setTimeout(() => {
        if (marker && marker.getLabel()) {
          marker.setLabel();
        }
      }, 5000);
    }
    
    // 更新到 attractionsData
    if (selectedDay.value > 0) {
      const dayIndex = selectedDay.value - 1;
      if (attractionsData.days && attractionsData.days[dayIndex]) {
        attractionsData.days[dayIndex].attractions = [...attractions.value];
      }
    }
    
    // 仍然更新坐标和基本显示
    updateInfoWindowAfterDrag(idx, lnglat);
    debouncedReplan();
    
    // 重置拖拽标志
    // isDragging.value = false;
  });
}




// POI搜索备用方案：500米范围内搜索最近的有名称的POI点
async function searchNearbyPOIs(lnglat) {
  const AMap = AMapRef.value;
  return new Promise((resolve, reject) => {
    const placeSearch = new AMap.PlaceSearch({
      pageSize: 20,
      pageIndex: 1,
      type: '餐饮服务|商务住宅|生活服务|医疗保健服务|体育休闲服务|政府机构及社会团体|道路附属设施|地名地址信息',
      city: '全国',
      citylimit: false,
      radius: 500, // 500米范围
      extensions: 'base'
    });

    placeSearch.searchNearBy('', lnglat, 500, (status, result) => {
      if (status === 'complete' && result.poiList && result.poiList.pois) {
        const pois = result.poiList.pois;
        // 按距离排序，选择最近的POI
        const nearestPOI = pois.find(poi => poi.name && poi.name.trim() !== '');
        
        if (nearestPOI) {
          resolve({
            name: nearestPOI.name,
            address: nearestPOI.address || '',
            location: nearestPOI.location,
            distance: nearestPOI.distance,
            type: nearestPOI.type
          });
        } else {
          reject(new Error('500米范围内无有效POI点'));
        }
      } else {
        reject(new Error('POI搜索失败'));
      }
    });
  });
}

// 完整的地理位置处理函数：地理编码失败时使用POI搜索备用方案
async function getCompleteLocationInfo(lnglat, originalPosition) {
  try {
    // 首先尝试地理编码
    const geocodeResult = await geocodeCoordinate(lnglat);
    
    // 如果地理编码成功但地址不完整或有问题的质量检查
    if (!geocodeResult.name || geocodeResult.name === '未知地点' || geocodeResult.address === '') {
      throw new Error('地理编码结果质量不佳');
    }
    
    return {
      success: true,
      method: 'geocode',
      data: geocodeResult,
      originalPosition: originalPosition
    };
    
  } catch (error) {
    console.warn('地理编码失败，尝试POI搜索备用方案:', error);
    
    try {
      // 地理编码失败时，使用POI搜索作为备用
      const poiResult = await searchNearbyPOIs(lnglat);
      
      if (poiResult && poiResult.location) {
        return {
          success: true,
          method: 'poi_search',
          data: {
            name: poiResult.name,
            address: poiResult.address,
            city: '',
            district: '',
            street: '',
            streetNumber: '',
            township: '',
            adcode: '',
            province: '',
            originalLnglat: lnglat,
            correctedLnglat: [poiResult.location.lng, poiResult.location.lat],
            distance: poiResult.distance,
            poiType: poiResult.type
          },
          originalPosition: originalPosition
        };
      } else {
        throw new Error('POI搜索无结果');
      }
      
    } catch (poiError) {
      console.error('POI搜索备用方案也失败:', poiError);
      
      // 所有方法都失败，返回原始位置
      return {
        success: false,
        method: 'none',
        error: '精确定位失败',
        data: {
          name: '精确定位失败',
          address: '',
          city: '',
          district: '',
          street: '',
          streetNumber: '',
          township: '',
          adcode: '',
          province: '',
          originalLnglat: lnglat
        },
        originalPosition: originalPosition
      };
    }
  }
}

// 地理编码服务：将坐标转换为实际地点名称
async function geocodeCoordinate(lnglat) {
  const AMap = AMapRef.value;
  return new Promise((resolve, reject) => {
    const geocoder = new AMap.Geocoder({
      city: '全国', // 搜索全国范围
      radius: 1000, // 搜索半径1公里
      batch: false
    });
    
    geocoder.getLocation(lnglat, (status, result) => {
      if (status === 'complete' && result.regeocode) {
        const regeocode = result.regeocode;
        
        // 获取地点名称（优先使用poiName，然后是formattedAddress）
        const placeName = regeocode.poiName || 
                         regeocode.formattedAddress || 
                         `${regeocode.addressComponent?.district || ''}${regeocode.addressComponent?.streetNumber?.street || ''}`;
        
        resolve({
          name: placeName || '未知地点',
          address: regeocode.formattedAddress || '',
          city: regeocode.addressComponent?.city || '',
          district: regeocode.addressComponent?.district || '',
          street: regeocode.addressComponent?.streetNumber?.street || '',
          streetNumber: regeocode.addressComponent?.streetNumber?.number || '',
          township: regeocode.addressComponent?.township || '',
          adcode: regeocode.addressComponent?.adcode || '',
          province: regeocode.addressComponent?.province || ''
        });
      } else {
        reject(new Error(`地理编码失败: ${status}`));
      }
    });
  });
}

// 更新后的地理编码缓存机制
const geocodeCache = new Map();

async function getGeocodedLocation(lnglat) {
  // 使用坐标作为缓存键
  const cacheKey = `${lnglat[0].toFixed(6)},${lnglat[1].toFixed(6)}`;
  
  // 检查缓存
  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey);
    // 缓存24小时
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }
  }
  
  try {
    // 使用新的完整位置处理机制
    const locationResult = await getCompleteLocationInfo(lnglat, lnglat);
    
    // 存入缓存
    geocodeCache.set(cacheKey, {
      data: locationResult,
      timestamp: Date.now()
    });
    
    return locationResult;
    
  } catch (error) {
    console.error('地理编码错误:', error);
    
    // 返回失败状态的数据结构
    return {
      success: false,
      method: 'none',
      error: '地理编码失败',
      data: {
        name: '未知地点',
        address: '',
        city: '',
        district: '',
        street: '',
        streetNumber: '',
        township: '',
        adcode: '',
        province: '',
        originalLnglat: lnglat
      },
      originalPosition: lnglat
    };
  }
}

// 更新拖拽后的信息窗体内容
function updateInfoWindowAfterDrag(idx, lnglat, locationData = null) {
  console.log(`更新信息窗体内容，索引：${idx}，新位置：${lnglat}`);
  
  const item = attractions.value[idx];
  
  // 如果有地理编码数据，使用实际地点名称
  if (locationData) {
    item.desc = `拖拽后更新为：${locationData.name}`;
    // address 已在 onMarkerDragEnd 中更新
  } else {
    // 清除原有的描述和地址内容
    item.desc = '';
    item.address = '';
  }
  
  // 格式化坐标显示
  const lng = lnglat[0].toFixed(6);
  const lat = lnglat[1].toFixed(6);
  
  // 更新标记点的标题和提示信息
  const marker = markers.value[idx];
  if (marker) {
    marker.setTitle(`${item.name} (${lng}, ${lat})`);
  }
}

// debounce函数已在文件上方声明，此处不需要重复声明


function focusItem(idx){ 
  console.log(2222222);
  const pos = attractions.value[idx].lnglat;
  map.value.setZoomAndCenter(Math.max(14, map.value.getZoom()), pos, { duration: 1000 }); 
  infoWindow.value?.open(map.value, pos); 
}

// 途径点动态管理
function addNewItem() {
  const newItem = {
    id: Date.now(),
    name: '新地点',
    time: '12:00',
    lnglat: map.value.getCenter(),
    desc: '',
    address: '',
    stayTime: 30, // 默认停留30分钟
    dragHistory: [] // 添加拖拽历史记录
  };
  attractions.value.push(newItem);
  createMarkers();
  debouncedReplan();
  
  // 更新到 attractionsData
  if (selectedDay.value > 0) {
    const dayIndex = selectedDay.value - 1;
    if (attractionsData.days && attractionsData.days[dayIndex]) {
      attractionsData.days[dayIndex].attractions = [...attractions.value];
    }
  }
}

function removeItem(idx) {
  if (attractions.value.length <= 2) {
    error.value = '至少需要保留起点和终点';
    return;
  }
  attractions.value.splice(idx, 1);
  createMarkers();
  debouncedReplan();
  
  // 更新到 attractionsData
  if (selectedDay.value > 0) {
    const dayIndex = selectedDay.value - 1;
    if (attractionsData.days && attractionsData.days[dayIndex]) {
      attractionsData.days[dayIndex].attractions = [...attractions.value];
    }
  }
}

function moveItemUp(idx) {
  if (idx <= 0 || idx >= attractions.value.length - 1) return; // 起点和终点不能移动
  const temp = attractions.value[idx - 1];
  attractions.value[idx - 1] = attractions.value[idx];
  attractions.value[idx] = temp;
  createMarkers();
  debouncedReplan();
  
  // 更新到 attractionsData
  if (selectedDay.value > 0) {
    const dayIndex = selectedDay.value - 1;
    if (attractionsData.days && attractionsData.days[dayIndex]) {
      attractionsData.days[dayIndex].attractions = [...attractions.value];
    }
  }
}

function moveItemDown(idx) {
  if (idx >= attractions.value.length - 2 || idx < 0) return; // 终点和起点前一个不能移动
  const temp = attractions.value[idx + 1];
  attractions.value[idx + 1] = attractions.value[idx];
  attractions.value[idx] = temp;
  createMarkers();
  debouncedReplan();
  
  // 更新到 attractionsData
  if (selectedDay.value > 0) {
    const dayIndex = selectedDay.value - 1;
    if (attractionsData.days && attractionsData.days[dayIndex]) {
      attractionsData.days[dayIndex].attractions = [...attractions.value];
    }
  }
}

function updateStayTime(idx, minutes) {
  attractions.value[idx].stayTime = parseInt(minutes) || 30;
  debouncedReplan();
}

// 添加导航功能
window.startNavigation = function(lng, lat, name) {
  const url = `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=1`;
  window.open(url, '_blank');
};

function clearRoute() {
  if (confirm('确定要清除当前路线吗？')) {
    clearAll();
    // 重新加载当前天的景点数据
    loadDayAttractions();
  }
}

function saveRoute(){ 
  const data = { 
    attractions: attractions.value, 
    styleMain, 
    styleAlt, 
    stats: routeStats.value,
    segmentPaths: segmentPolylines.value.map(polyline => polyline ? polyline.getPath().map(p => [p.lng, p.lat]) : []),
    version: '2.0'
  }; 
  localStorage.setItem("route.v2", JSON.stringify(data)); 
}

function loadRoute(){ 
  const raw = localStorage.getItem("route.v2"); 
  if(!raw) return; 
  const data = JSON.parse(raw); 
  styleMain.color = data.styleMain?.color || styleMain.color; 
  styleMain.weight = data.styleMain?.weight || styleMain.weight; 
  styleAlt.color = data.styleAlt?.color || styleAlt.color; 
  styleAlt.weight = data.styleAlt?.weight || styleAlt.weight; 
  if(Array.isArray(data.segmentPaths)){ 
    clearSegmentRoutes();
    data.segmentPaths.forEach((path, index) => {
      if (path.length > 0) {
        const polyline = new AMap.Polyline({
          path: path,
          strokeColor: segmentColors.value[index % segmentColors.value.length],
          strokeWeight: 6,
          strokeOpacity: 0.8
        });
        polyline.setMap(map.value);
        segmentPolylines.value[index] = polyline;
      }
    });
    fitView(); 
  } 
}

function resetView(){ fitView(); }

// 处理查看旅行计划按钮点击事件
function handleViewTravelPlan() {
  const userid = getGlobalParam('userid', '');
  const queryKeyword = getGlobalParam('query_keyword', 'abc');
  console.log(`查看旅行计划: userid=${userid}, query_keyword=${queryKeyword}`);
  // 路由跳转已由router-link处理，这里仅做日志记录和额外处理
}

onMounted(async () => { 


  // 首先解析URL参数
  parseUrlParams();
  globalState.appConfig.isInitialized = true;
  
  // 可以在这里使用URL参数进行初始化
  const initialDay = getGlobalParam('day', 1);
  if (initialDay && initialDay >= 1 && initialDay <= 3) {
    selectedDay.value = initialDay;
    console.log('使用URL参数初始化天数:', initialDay);
  }
  
  await loadAMap(); // 只加载地图，不获取数据
  
  // 添加点击外部区域关闭弹出列表的监听
  document.addEventListener('click', (event) => {
    const daySelector = document.querySelector('.day-selector');
    if (daySelector && !daySelector.contains(event.target)) {
      closeDaySelector();
    }
  });
  
  // 使用saveRouteRemote方法作为唯一的数据获取和渲染来源
  await saveRouteRemote();

  if (attractionsData.trip_info?.total_days > 0) {
    console.log(attractionsData.trip_info?.total_days);
    onDayChange(1);
  }
});

onMounted(() => {
  // 解析URL参数
  parseUrlParams();
  // 简化为只处理query_keyword参数，移除其他参数处理逻辑
});

onUnmounted(() => { if (map.value) map.value.destroy(); });

// 统一的日志记录函数
function logMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logContent = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (level === 'error') {
    console.error(logContent, data);
  } else if (level === 'warn') {
    console.warn(logContent, data);
  } else {
    console.log(logContent, data);
  }
}

// 统一的错误处理函数
function handleError(error, operation) {
  let errorMessage = `操作失败: ${operation}`;
  
  if (error instanceof TypeError) {
    errorMessage = `类型错误: ${error.message}`;
  } else if (error instanceof SyntaxError) {
    errorMessage = `语法错误: ${error.message}`;
  } else if (error.message?.includes('Network')) {
    errorMessage = '网络连接失败，请检查网络设置';
  } else {
    errorMessage = `未知错误: ${error.message || '无详细信息'}`;
  }
  
  logMessage('error', errorMessage, { operation, error });
  
  // 这里可以添加用户友好的错误提示，例如使用全局提示组件
  // 假设有一个全局的showToast方法
  if (globalState.showToast) {
    globalState.showToast(errorMessage, 'error');
  }
  
  return errorMessage;
}


</script>

<style scoped>
.route-planner {
  transform: translateY(-20px);
  overflow: hidden;
}

/* 地图容器全屏显示优化 */
#container { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  top: 0;
}

.plan-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  padding: 0;
}

.left {
  flex: 2;
  min-width: 400px;
  max-width: 500px;
  overflow: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
  /* height: 80%; */
  margin-top: 40px;
}

.right {
  flex: 8;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.panel {
  /* flex:7; */
  overflow-y: hidden;
  position: relative;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--gradient-primary);
  color: var(--white);
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  user-select: none;
  transition: var(--transition-fast);
}

.panel-header:hover {
  background: linear-gradient(90deg, #3498DB 0%, #2980B9 100%);
}

.toggle-icon {
  font-size: 0.9rem;
  transition: var(--transition-fast);
}

/* 天数选择器 */
.day-selector {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.day-selector-title {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 10px;
  font-weight: 500;
}

.day-selector-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-gray-light);
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: var(--transition-fast);
  border: 2px solid transparent;
}

.day-selector-trigger:hover {
  background: var(--white);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.current-selection {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.dropdown-arrow {
  font-size: 0.8rem;
  color: var(--text-light);
  transition: var(--transition-fast);
}

.dropdown-arrow.arrow-up {
  transform: rotate(180deg);
}

/* 弹出式天数选择列表 */
.day-selector-popup {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  margin-top: 8px;
  animation: scaleIn 0.3s ease-out;
}

.day-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.day-selector-list {
  background: var(--white);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.day-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
  transition: var(--transition-fast);
  border-bottom: 1px solid var(--border-color);
}

.day-option:last-child {
  border-bottom: none;
}

.day-option:hover {
  background: var(--primary-transparent-20);
  transform: translateX(4px);
}

.day-option-active {
  background: var(--primary-transparent-30);
  color: var(--color-primary);
  font-weight: 600;
}

.day-option-text {
  font-size: 1rem;
  color: var(--text-primary);
}

.day-option-subtitle {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-left: 8px;
}

.day-option-check {
  color: var(--success-color);
  font-weight: bold;
  font-size: 1.2rem;
}

/* 面板内容区域 */
.panel-content {
  /* max-height: 350px; */
  height: 270px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
padding: 5px;
}

/* 地点项 */
.panel-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition-fast);
  background: var(--white-transparent-30);
}

.panel-item:last-child {
  border-bottom: none;
}

.panel-item:hover {
  background: var(--primary-transparent-20);
}

.panel-item-start .item-marker {
  background: #10b981 !important;
}

.panel-item-end .item-marker {
  background: #ef4444 !important;
}

.item-marker {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--white);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-time {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 4px;
  font-weight: 500;
}

.item-name {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  display: flex;
  gap: 6px;
  margin-left: 12px;
}

.item-actions button {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-move-up {
  background: var(--primary-transparent-20);
  color: var(--color-primary);
}

.btn-move-up:hover {
  background: var(--color-primary);
  color: var(--white);
  transform: translateY(-2px);
}

.btn-move-down {
  background: var(--primary-transparent-20);
  color: var(--color-primary);
}

.btn-move-down:hover {
  background: var(--color-primary);
  color: var(--white);
  transform: translateY(2px);
}

.btn-remove {
  background: var(--danger-color-bg);
  color: var(--danger-color);
}

.btn-remove:hover {
  background: var(--danger-color);
  color: var(--white);
  transform: scale(1.1);
}

/* 添加按钮区域 */
.panel-actions {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.btn-add {
  width: 100%;
  padding: 12px;
  background: var(--gradient-primary);
  color: var(--white);
  border: none;
  border-radius: var(--radius-medium);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition-fast);
  box-shadow: var(--shadow-light);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* 通用样式 */
.glass-card {
  background: var(--white-transparent-10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--white-transparent-18);
  box-shadow: var(--shadow-heavy);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  font-size: 0.95rem;
  color: var(--text-primary);
  /* padding: 10px 14px;
  background: var(--bg-gray-light); */
  border-radius: var(--radius-medium);
  font-weight: 500;
  border: 1px solid var(--border-color);
  transition: var(--transition-fast);
}

.stat-item:hover {
  background: var(--primary-transparent-20);
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.stat-items {
  display: flex;
  flex-direction: row;
  gap: 10px;
  /* padding-bottom: 10px; */
  border-bottom: 1px solid var(--border-color);
      padding-bottom: 10px;
}

.stat-item-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.travel-plan-link {
  display: inline-block;
  padding: 10px 14px;
  background: var(--gradient-primary);
  color: var(--white);
  border-radius: var(--radius-medium);
  font-weight: 600;
  text-align: center;
  transition: var(--transition-fast);
  box-shadow: var(--shadow-light);
}

.travel-plan-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.actions1 {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 10px;
  justify-content: space-around;
  position: absolute;
  width: 100%;
  position: relative;
}

.actions1 button {
  padding: 12px 16px;
  border-radius: var(--radius-medium);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition-fast);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: var(--gradient-primary);
  color: var(--white);
  box-shadow: var(--shadow-light);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn-secondary {
  background: var(--bg-gray-light);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--primary-transparent-20);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
}

.btn-danger {
  background: var(--danger-color-bg);
  color: var(--danger-color);
  border: 2px solid var(--danger-color);
}

.btn-danger:hover {
  background: var(--danger-color);
  color: var(--white);
  transform: translateY(-2px);
}

/* 滚动条样式 */
.left::-webkit-scrollbar {
  width: 6px;
}

.left::-webkit-scrollbar-track {
  background: transparent;
}

.left::-webkit-scrollbar-thumb {
  background: rgba(200, 200, 200, 0.3);
  border-radius: 3px;
}

.left::-webkit-scrollbar-thumb:hover {
  background: rgba(200, 200, 200, 0.5);
}

.panel-content::-webkit-scrollbar {
  width: 5px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}

.day-selector-list::-webkit-scrollbar {
  width: 5px;
}

.day-selector-list::-webkit-scrollbar-track {
  background: transparent;
}

.day-selector-list::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left {
    min-width: 350px;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .plan-container {
    flex-direction: column;
  }
  
  .left {
    min-width: 100%;
    max-width: 100%;
    max-height: 50vh;
  }
  
  .right {
    flex: 1;
  }
  
  .actions {
    grid-template-columns: 1fr;
  }
}


.hero-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.1) 100%);
  z-index: -1;
  overflow: hidden;
}

/* 几何图形装饰 */
.hero-background::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 50px,
      rgba(52, 152, 219, 0.03) 50px,
      rgba(52, 152, 219, 0.03) 51px
    );
  animation: geometricFloat 60s linear infinite;
  pointer-events: none;
}

.hero-background::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 50px,
      rgba(52, 152, 219, 0.02) 50px,
      rgba(52, 152, 219, 0.02) 51px
    );
  animation: geometricFloat 40s linear infinite reverse;
  pointer-events: none;
}

@keyframes geometricFloat {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--white-transparent-10) 0%, transparent 20%),
    radial-gradient(circle at 80% 50%, var(--white-transparent-10) 0%, transparent 30%),
    radial-gradient(circle at 40% 80%, var(--white-transparent-10) 0%, transparent 25%),
    radial-gradient(circle at 70% 20%, var(--white-transparent-10) 0%, transparent 15%);
  animation: floatBackground 20s ease-in-out infinite;
}

@keyframes floatBackground {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* 中文文字装饰层（静态展示，无交互） */
.hero-text-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; /* 禁用鼠标交互 */
  overflow: visible;
  z-index: 0;
}

.text-decor {
  position: absolute;
  white-space: nowrap;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0.15;
  color: var(--color-primary);
  user-select: none;
  transform-origin: center center;
  transform: rotate(var(--rotation, 0deg));
}

/* 左侧大字号文字 */
.text-left-large {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(4rem, 10vw, 8rem);
}

/* 左侧中等字号文字 */
.text-left {
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
}

/* 右侧中等字号文字 */
.text-right {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
}

/* 右侧小字号文字 */
.text-right-small {
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

</style>