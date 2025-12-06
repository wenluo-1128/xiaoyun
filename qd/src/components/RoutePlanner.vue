<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, provide } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import localAttractions from "../data/1.json";
const attractionsData = reactive(localAttractions);

// 全局状态对象
const globalState = reactive({
  // 存储从URL参数解析的参数
  urlParams: {},
  
  // 其他全局状态
  appConfig: {
    isInitialized: false
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
  
  // 处理userid参数
  if (urlParams.has('userid')) {
    params.userid = urlParams.get('userid');
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

const segmentPolylines = ref([]); // 新增：分段路线可视化
const segmentColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];
const styleMain = reactive({ color: "#3b82f6", weight: 5, opacity: 0.9 });
const styleAlt = reactive({ color: "#9ca3af", weight: 3, opacity: 0.7 });
const panelOpen = ref(true);
const avoidPolygons = ref([]);
const queue = reactive({ max: 3, active: 0, list: [] });
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

async function saveRouteRemote(){
  try {
    logMessage('info', '开始执行saveRouteRemote方法，获取用户认证和地图数据');
    
    // 获取用户认证信息
    const userId = getGlobalParam('userid', '');
    const queryKeyword = getGlobalParam('query_keyword', 'abc');
    
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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    
    const data = await response.json();
    logMessage('debug', '获取到的数据', { dataLength: Array.isArray(data) ? data.length : '非数组' });
    
    // 检查数据有效性并更新地图
    if (Array.isArray(data) && data.length > 0 && data[0].plan_data) {
      const planData = data[0].plan_data;
      logMessage('info', '成功获取地图数据，准备更新地图');
      
      // 更新地图数据
      attractionsData.trip_title = planData.trip_title || '';
      attractionsData.days = planData.days || [];
      attractionsData.trip_info = planData.trip_info || {};
      
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
      
    } else {
      logMessage('warn', '未获取到有效的地图数据', { data });
      // 添加用户提示
      if (globalState.showToast) {
        globalState.showToast('未获取到有效的行程数据', 'warning');
      }
    }
    
    // 保存计划数据的逻辑（原有功能）
    const plan = { 
      trip_title: attractionsData.trip_title || '', 
      days: attractionsData.days || [], 
      trip_info: attractionsData.trip_info || {} 
    };
    
    // 检查是否有URL参数需要添加到保存的数据中
    if (Object.keys(globalState.urlParams).length > 0) {
      plan.urlParams = { ...globalState.urlParams };
      logMessage('debug', '添加URL参数到计划数据', { urlParams: plan.urlParams });
    }
    
    // 保存数据时也添加超时处理
    const saveController = new AbortController();
    const saveTimeoutId = setTimeout(() => saveController.abort(), 15000); // 15秒超时
    
    logMessage('info', '开始保存计划数据到服务器');
    await fetch(url.toString(), { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }, 
      body: JSON.stringify({ plan_data: plan }),
      signal: saveController.signal
    });
    
    clearTimeout(saveTimeoutId);
    logMessage('info', '计划数据保存成功');
    
    return true; // 成功返回
    
  } catch (error) {
    if (error.name === 'AbortError') {
      logMessage('error', '请求超时，操作已取消');
      if (globalState.showToast) {
        globalState.showToast('请求超时，请稍后重试', 'error');
      }
    } else {
      handleError(error, '保存或获取地图数据');
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
    maxZoom:18 
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
  
  // 先清理旧标记点
  if (markers.value.length > 0) {
    map.value.remove(markers.value);
  }
  
  markers.value = attractions.value.map((item, idx) => {
    const content = `<div style="transform:translate(-50%,-100%);background:${markerColorByIndex(idx)};width:16px;height:16px;border-radius:50%;box-shadow:0 0 0 2px #fff"></div>`;
    const marker = new AMap.Marker({ position: item.lnglat, title: item.name, draggable: true, content });
    marker.on("click", () => {
      // 格式化坐标显示
      const lng = item.lnglat[0].toFixed(6);
      const lat = item.lnglat[1].toFixed(6);
      
      // 获取实际地点名称（优先使用地址，备选名称）
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
    marker.on("dragend", (e) => onMarkerDragEnd(idx, marker, [e.lnglat.lng, e.lnglat.lat]));
    return marker;
  });
  map.value.add(markers.value);
}

function pathFromAttractions() { return attractions.value.map((a) => a.lnglat); }

function renderMainPath(path){
  const AMap = AMapRef.value;
  if(mainPolyline.value){
    mainPolyline.value.setPath(path);
    mainPolyline.value.setOptions({ strokeColor: styleMain.color, strokeWeight: styleMain.weight, strokeOpacity: styleMain.opacity });
  }else{
    mainPolyline.value = new AMap.Polyline({ map: map.value, path, strokeColor: styleMain.color, strokeWeight: styleMain.weight, strokeOpacity: styleMain.opacity });
  }
}

function renderAltPaths(routes){
  const AMap = AMapRef.value;
  altPolylines.value.forEach(pl=> pl.setMap(null));
  altPolylines.value = [];
  for(let i=1;i<routes.length;i++){
    const path = routes[i].steps.flatMap(s=> s.path);
    const pl = new AMap.Polyline({ map: map.value, path, strokeColor: styleAlt.color, strokeWeight: styleAlt.weight, strokeOpacity: styleAlt.opacity, strokeStyle: "dashed" });
    altPolylines.value.push(pl);
  }
}

function updateStatsFromRoute(route) {
  if (!route) return;
  routeStats.distance = route.distance || 0;
  routeStats.duration = route.time || 0;
}

function getCache(key){
  const raw = localStorage.getItem(key);
  if(!raw) return null;
  const { ts, data } = JSON.parse(raw);
  if(Date.now() - ts > 3600_000) return null;
  return data;
}

function setCache(key, data){ localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); }

function enqueue(fn){ queue.list.push(fn); runQueue(); }
function runQueue(){ while(queue.active < queue.max && queue.list.length){ const job = queue.list.shift(); queue.active++; job().finally(()=>{ queue.active--; runQueue(); }); } }

// 多段式路线规划核心算法
async function planMultiSegmentDriving(){
  const AMap = AMapRef.value;
  const points = attractions.value;
  
  // 计算总停留时间
  routeStats.totalStayTime = points.reduce((total, point) => total + (point.stayTime || 30), 0);
  
  // 清除之前的分段路线
  clearSegmentRoutes();
  
  // 如果只有两个点（起点和终点），使用单段规划
  if (points.length <= 2) {
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
        hideMarkers: true
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
  segmentPolylines.value.forEach(polyline => {
    polyline.setMap(null);
  });
  segmentPolylines.value = [];
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
  
  fitView();
}

// 缓存相关函数更新
function cacheKey(points){
  const opts = { policy: "REAL_TRAFFIC", ferry: 0, avoid: avoidPolygons.value, segmented: true };
  return `amap_v2_seg:${btoa(unescape(encodeURIComponent(JSON.stringify({ points, opts })))).slice(0,64)}`;
}

function fitView(){
  const overlays = [ ...markers.value ];
  if(mainPolyline.value) overlays.push(mainPolyline.value);
  map.value.setFitView(overlays);
  const z = map.value.getZoom();
  if(z<12) map.value.setZoom(12);
  if(z>18) map.value.setZoom(18);
}

// 处理标记点拖拽结束事件
function onMarkerDragEnd(idx, marker, lnglat) {
  console.log(`标记点 ${idx} 拖拽到新位置:`, lnglat);
  
  // 设置加载状态提示
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
  
  // 更新位置到景点数据中
  attractions.value[idx].lnglat = [...lnglat];
  attractions.value[idx].lastDragPosition = [...lnglat];
  
  // 调用新的完整位置处理函数
  getGeocodedLocation(lnglat).then(result => {
    
    // 清除加载状态
    setTimeout(() => {
      if (marker) {
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
    
    // 更新信息窗体内容
    updateInfoWindowAfterDrag(idx, lnglat, result);
    
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
      if (marker) {
        marker.setLabel();
      }
    }, 5000);
    
  }).catch(error => {
    console.error('地理位置处理失败:', error);
    
    // 地理编码失败时显示错误状态
    if (marker) {
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
        marker.setLabel();
      }, 5000);
    }
    
    // 仍然更新坐标和基本显示
    updateInfoWindowAfterDrag(idx, lnglat);
    debouncedReplan();
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

function togglePanel(){ panelOpen.value = !panelOpen.value; }
function focusItem(idx){ const pos = attractions.value[idx].lnglat; map.value.setZoomAndCenter(Math.max(14, map.value.getZoom()), pos, { duration: 1000 }); infoWindow.value?.open(map.value, pos); }

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
}

function removeItem(idx) {
  if (attractions.value.length <= 2) {
    error.value = '至少需要保留起点和终点';
    return;
  }
  attractions.value.splice(idx, 1);
  createMarkers();
  debouncedReplan();
}

function moveItemUp(idx) {
  if (idx <= 0 || idx >= attractions.value.length - 1) return; // 起点和终点不能移动
  const temp = attractions.value[idx - 1];
  attractions.value[idx - 1] = attractions.value[idx];
  attractions.value[idx] = temp;
  createMarkers();
  debouncedReplan();
}

function moveItemDown(idx) {
  if (idx >= attractions.value.length - 2 || idx < 0) return; // 终点和起点前一个不能移动
  const temp = attractions.value[idx + 1];
  attractions.value[idx + 1] = attractions.value[idx];
  attractions.value[idx] = temp;
  createMarkers();
  debouncedReplan();
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

function applyStyle(){ if (mainPolyline.value) renderMainPath(mainPolyline.value.getPath()); }

  // 从全局状态中获取query_keyword参数，如果没有则使用默认值'abc'
  // 不再使用固定变量，而是在API调用时动态获取query_keyword参数

async function loadRemoteData() {
  try {
    // 只获取query_keyword参数，设置默认值
    const queryKeyword = getGlobalParam('query_keyword', 'abc');
    
    // 构建URL，只包含query_keyword参数
    const url = new URL(`http://${import.meta.env.VITE_IP}:3005/api/data`);
    url.searchParams.append('query_keyword', queryKeyword);
    
    const r = await fetch(url.toString());
    const arr = await r.json();
    
    // 移除地图数据处理逻辑，将在其他方法中实现
  } catch (error) {
    console.error('加载远程数据失败:', error);
  }
}

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

<template>
  <div class="wrap">
    <!-- 地点列表控制面板 -->
    <div class="panel" :class="{ 'panel-collapsed': !panelOpen }">
      <div class="panel-header" @click="togglePanel">
        <span>行程地点</span>
        <span class="toggle-icon">{{ panelOpen ? '▲' : '▼' }}</span>
      </div>
      <div class="day-selector">
        <div class="day-selector-title">选择旅游天数：</div>
        <div class="day-selector-trigger" @click="toggleDaySelector($event)" ref="daySelectorTrigger">
          <span class="current-selection">
            {{ attractionsData.days?.[selectedDay - 1]?.title || `第${selectedDay}天` }}
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
        
        <!-- 停留时间设置 -->
        <div class="stay-time-section">
          <div class="stay-time-header">⏰ 停留时间设置</div>
          <div v-for="(item, idx) in attractions" :key="`stay-${item.id}`" class="stay-time-item">
            <span class="stay-time-name">{{ item.name }}</span>
            <input 
              type="number" 
              :value="item.stayTime" 
              @input="updateStayTime(idx, $event.target.value)"
              class="stay-time-input"
              min="0"
              max="480"
              placeholder="分钟"
            />
            <span class="stay-time-unit">分钟</span>
          </div>
        </div>
        
        <div class="panel-actions">
          <button @click="addNewItem" class="btn-add">+ 添加途径点</button>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="stats">
        <span class="stat-item">📍 {{ attractionsData.trip_title }}</span>
        <span class="stat-item">{{ attractionsData.days?.[selectedDay - 1]?.title || '第' + selectedDay + '天' }}</span>
        <span class="stat-item">📏 距离：{{ distanceText }}</span>
        <span class="stat-item">⏱️ 预计：{{ durationText }}</span>
        <span class="stat-item">🏁 段数：{{ routeStats.segments?.length || 0 }}</span>
        <span class="stat-item">⏰ 停留：{{ formatStayTime(routeStats.totalStayTime || 0) }}</span>
        <!-- 进入网页浏览旅行计划按钮 -->
        <!-- 默认userid为 -->
<router-link 
  :to="`/travel-plan-view/${getGlobalParam('userid', '23')}/${getGlobalParam('query_keyword', 'abc')}`" 
  class="travel-plan-link"
  @click="handleViewTravelPlan"
>进入网页浏览旅行计划</router-link>
      </div>
      <div class="actions">
        <button @click="resetView" class="btn-primary">🔍 视野适配</button>
        <button @click="saveRouteRemote" class="btn-secondary">💾 保存路线</button>
        <button @click="loadRoute" class="btn-secondary">📂 加载路线</button>
        <button @click="clearRoute" class="btn-danger">🗑️ 清除路线</button>
      </div>
    </div>

    <!-- 地图容器 -->
    <div id="container"></div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>路线计算中... {{ progress }}%</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-toast">
      <span>{{ error }}</span>
      <button @click="error = null">×</button>
    </div>
  </div>
</template>

<style scoped>
.wrap { position: relative; height: 100vh; }
#container { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  top: 0;
  left: 0;
}

/* 地点列表控制面板 */
.panel {
  position: absolute;
  z-index: 10;
  left: 10px;
  top: 60px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}

.panel-collapsed {
  height: 40px;
}

.panel-header {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
}

/* 天数选择器样式 */
.day-selector {
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.day-selector-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.day-selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.day-selector-trigger:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.current-selection {
  color: #374151;
  font-weight: 500;
}

.dropdown-arrow {
  color: #6b7280;
  font-size: 12px;
  transition: transform 0.2s ease;
}

.dropdown-arrow.arrow-up {
  transform: rotate(180deg);
}

/* 弹出式选择列表 */
.day-selector-popup {
  position: absolute;
  top: 100%;
  left: 16px;
  right: 16px;
  z-index: 1000;
  margin-top: 4px;
}

.day-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: -1;
}

.day-selector-list {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: dropdownSlide 0.2s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.day-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.day-option:last-child {
  border-bottom: none;
}

.day-option:hover {
  background: #f8fafc;
}

.day-option-active {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.day-option-text {
  font-weight: 500;
  color: #374151;
  margin-right: 12px;
}

.day-option-subtitle {
  flex: 1;
  color: #6b7280;
  font-size: 13px;
}

.day-option-check {
  color: #3b82f6;
  font-weight: bold;
  font-size: 16px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .day-selector-popup {
    left: 16px;
    right: 16px;
  }
  
  .day-option {
    padding: 10px 12px;
  }
  
  .day-option-subtitle {
    font-size: 12px;
  }
}

.toggle-icon {
  font-size: 12px;
  color: #64748b;
}

.panel-content {
  max-height: 400px;
  overflow-y: auto;
}

.panel-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.2s;
}

.panel-item:hover {
  background-color: #f8fafc;
}

.panel-item-start {
  border-left: 3px solid #10b981;
}

.panel-item-end {
  border-left: 3px solid #ef4444;
}

.item-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-time {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  margin-left: 8px;
  display: flex;
  gap: 4px;
}

.btn-remove,
.btn-move-up,
.btn-move-down {
  width: 20px;
  height: 20px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-move-up,
.btn-move-down {
  background: #3b82f6;
  font-size: 10px;
  font-weight: bold;
}

.btn-move-up:hover {
  background: #2563eb;
}

.btn-move-down:hover {
  background: #2563eb;
}

.btn-remove:hover {
  background: #dc2626;
}

/* 停留时间设置样式 */
.stay-time-section {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.stay-time-header {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e5e7eb;
}

.stay-time-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
  gap: 8px;
}

.stay-time-name {
  flex: 1;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stay-time-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.stay-time-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.stay-time-unit {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

.panel-actions {
  padding: 12px 16px;
}

.btn-add {
  width: 100%;
  padding: 8px 12px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.btn-add:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* 工具栏 */
.toolbar {
  position: absolute;
  z-index: 10;
  left: 10px;
  top: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.travel-plan-link {
  margin: 0 8px;
  padding: 4px 12px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.travel-plan-link:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* 加载状态 */
.loading {
  position: absolute;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  background: rgba(17, 17, 17, 0.9);
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 11;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-toast {
  position: absolute;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.error-toast button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-toast button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

/* 全局信息窗体样式优化 */
:deep(.amap-info-window) {
  background: #FFFFFF !important;
  opacity: 1 !important;
  box-shadow: none !important;
  border: none !important;
  border-radius: 0 !important;
}

:deep(.amap-info-window-content) {
  background: #FFFFFF !important;
  opacity: 1 !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.amap-info-window-top) {
  display: none !important;
}

:deep(.amap-info-window-bottom) {
  display: none !important;
}

/* 地图容器全屏显示优化 */
#container { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  top: 0;
  left: 0;
}

.wrap {
  height: 100vh !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 面板和工具栏适应全屏模式 */
.panel {
  position: absolute;
  z-index: 10;
  left: 10px;
  top: 60px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}
</style>

