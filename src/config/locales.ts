// src/config/locales.ts

export const defaultTexts = {
  node: {
    _: "Node Info", // 节点信息
    name: "Node Name", // 节点名称
    details: "{name} Details", // {name} 详情
    cores: "Cores",
    cpu: "CPU",
    mem: "RAM", // 内存
    swap: "SWAP",
    disk: "Storage", // 硬盘
    traffic: "Traffic Quota", // 流量
    network: "Network", // 网络
    load: "Load", // 负载
    uptime: "Runtime", // 运行时数
    expiredAt: "Expiry", // 到期:
    offline: "Offline", // 离线
    online: "Online", // 在线
    off: "OFF",
    unlimited: "Unlimited", // 无限制
    notAvailable: "N/A",
    notEnabled: "Not enabled", // 未启用
    expired: "Expired", // 已过期
    daysLeft: "{daysLeft} days left", // 余 {daysLeft} 天
    longTerm: "Long term", // 长期
    notSet: "Not set", // 未设置
    tags: "Tags", // 标签
    speed: "Speed", // 网速
    quota: "Quota", // 配额
    trafficTypeSum: "Total", // 总和
    trafficTypeMax: "Maximum", // 最大值
    trafficTypeMin: "Minimum", // 最小值
    trafficTypeUp: "Upload", // 上传
    trafficTypeDown: "Download", // 下载
    free: "FREE", // 免费
    billingCycleDays: "{days} days", // {days}天
    billingCycleMonth: "mo", // 月
    billingCycleQuarter: "3mo", // 季
    billingCycleHalfYear: "6mo", // 半年
    billingCycleYear: "yr", // 年
    billingCycleTwoYears: "2yrs", // 两年
    billingCycleThreeYears: "3yrs", // 三年
    billingCycleFiveYears: "5yrs", // 五年
    uploadPrefix: "↑",
    downloadPrefix: "↓",
  },
  common: {
    _: "Common", // 通用
    loading: "Loading...", // 加载中...
  },
  api: {
    _: "API", // 接口
    unknownRpcError: "Unknown RPC error", // 未知 RPC 错误
    unknownNetworkError: "Unknown network error", // 未知网络错误
    unknownError: "Unknown error", // 未知错误
    unknownValue: "unknown", // 未知
  },
  header: {
    _: "Header", // 标题栏
    toggleView: "Toggle view", // 切换视图
    grid: "Grid view", // 网格视图
    compact: "Compact view", // 紧凑视图
    table: "Table view", // 表格视图
    toggleTheme: "Toggle theme", // 切换主题
    lightMode: "Light mode", // 浅色模式
    darkMode: "Dark mode", // 深色模式
    systemMode: "Follow system", // 跟随系统
    admin: "Admin", // 管理员
    logoAlt: "Site logo", // 站点 Logo
  },
  footer: {
    _: "Footer", // 底栏
    poweredBy: "Powered by",
    themeBy: "Theme by",
    with: "with", // 与
  },
  homePage: {
    _: "Home", // 主页
    loadingData: "Fetching data...", // 正在努力获取数据中...
    loadingConfig: "Loading configuration...", // 加载配置中...
    noDetailsAvailable: "Detailed info and latency chart are disabled", // 未启用详细信息与延迟图表
    errorFetchingNodes: "Failed to fetch node data", // 获取节点数据失败
    noNodes: "No node data", // 暂无节点数据
    retryFetchingNodes: "Failed to fetch node data, please retry", // 获取节点数据失败，请重试
    addNodesInAdmin: "Please add nodes in admin first", // 请先通过管理端添加节点
    addNode: "Add node", // 添加节点
  },
  group: {
    _: "Group", // 分组
    name: "Group", // 分组
    selectTitle: "Select group", // 选择分组
    all: "All", // 所有
  },
  sort: {
    _: "Sort", // 排序
    title: "Sort by", // 排序方式
    trafficUp: "By upload traffic", // 按上传流量
    trafficDown: "By download traffic", // 按下载流量
    speedUp: "By upload speed", // 按上传速率
    speedDown: "By download speed", // 按下载速率
    reset: "Reset sort", // 重置排序
  },
  search: {
    _: "Search", // 搜索
    placeholder: "Search servers...", // 搜索服务器...
    notFound: "Not Found",
    tryChangingFilters: "Try changing filters", // 请尝试更改筛选条件
    clear: "Clear search", // 清空搜索
    retry: "Retry", // 重试
  },
  statsBar: {
    _: "Status Bar", // 状态栏
    currentTime: "Time", // 当前时间
    displayOptionsTitle: "Status display settings", // 状态显示设置
    currentOnline: "Online", // 当前在线
    region: "Regions", // 点亮地区
    trafficShort: "Quota", // 流量
    traffic: "Traffic Overview", // 流量概览
    networkSpeedShort: "Speed", // 网速
    networkSpeed: "Realtime Network", // 网络速率
    statsHidden: "Statistics are hidden", // 统计信息已隐藏
  },
  instancePage: {
    _: "Details Page", // 详情页
    title: "Detailed Information", // 详细信息
    cpu: "CPU",
    architecture: "Architecture", // 架构
    virtualization: "Virtualisation", // 虚拟化
    gpu: "GPU",
    os: "Operating System", // 操作系统
    mem: "RAM", // 内存
    swap: "SWAP", // 交换内存
    disk: "Storage", // 磁盘
    load: "Load", // 负载
    realtimeNetwork: "Realtime Network", // 实时网络
    totalTraffic: "Traffic Statistics", // 总流量
    runtime: "Runtime", // 运行时数
    lastUpdated: "Last Reported", // 最后上报
    loadingNodeInfo: "Loading node information...", // 正在获取节点信息...
    nodeNotFound: "Node not found", // 未找到该节点
    enteringNodeDetails: "Entering node details...", // 正在进入节点详情...
    latency: "Latency", // 延迟
    live: "Live", // 实时
    hours: "{count}h", // {count}小时
    days: "{count}d", // {count}天
    optionLoad: "Load", // 负载
    optionPing: "Latency", // 延迟
  },
  chart: {
    _: "Charts", // 图表信息
    loading: "Loading chart...", // 正在加载图表...
    loadingData: "Loading chart data...", // 正在加载图表数据...
    noData: "No data", // 暂无数据
    nodeOfflineCannotFetchLiveData:
      "Node is offline, cannot fetch live data", // 节点已离线，无法获取实时数据
    offlineForTooLong:
      "Offline for more than {hours} hours, no data found", // 离线时间超过 {hours} 小时，未找到任何数据
    fetchHistoricalDataError: "Failed to fetch historical data", // 获取历史数据失败
    fetchInitialRealtimeDataError:
      "Failed to fetch initial realtime data", // 获取初始实时数据失败
    fetchPingHistoryError: "Failed to fetch ping history data", // 获取延迟历史数据失败
    cpu: "CPU",
    memory: "RAM", // 内存
    swap: "SWAP", // 交换
    disk: "Storage", // 磁盘
    network: "Network", // 网络
    tcpPrefix: "TCP:",
    udpPrefix: "UDP:",
    connections: "Connections", // 连接数
    processes: "Processes", // 进程数
    cpuUsageTooltip: "CPU usage", // CPU 使用率
    memoryUsageTooltip: "RAM", // 内存
    swapUsageTooltip: "SWAP", // 交换
    diskUsageTooltip: "Storage", // 磁盘
    download: "Download", // 下载
    upload: "Upload", // 上传
    tcpConnections: "TCP connections", // TCP 连接
    udpConnections: "UDP connections", // UDP 连接
    processesTooltip: "Process count", // 进程数
    smooth: "Smooth", // 平滑
    connectBreaks: "Connect breaks", // 连接断点
    hideAll: "Hide all", // 隐藏全部
    showAll: "Show all", // 显示全部
    resetRange: "Reset range", // 重置范围
    oneQuarter: "1/4", // 四分之一
  },
  notFoundPage: {
    _: "404 Page", // 404页面
    title: "404 - Not Found",
    description: "The page you are looking for does not exist.",
    goToHome: "Go to Home",
  },
  privatePage: {
    _: "Private Page", // 私有页面
    title: "This site is private", // 站点已设为私有
    description: "Sign in to access data", // 登录后才能获取数据
    goToLogin: "Go to login", // 前往登录
  },
};

export const otherTexts = {
  chart: {
    packetLossCalculationWarning:
      "<p>The packet-loss calculation is not fully accurate. Please use it as reference only.</p>", // 丢包率计算算法并不准确，谨慎参考
    smoothTooltipContent:
      '<h2 class="text-lg font-bold">About Data Smoothing</h2><p>When enabled smoothing, the curve shown in the chart is processed with <strong>Exponential Weighted Moving Average (EWMA)</strong>, a common smoothing method.</p></br><p>Please note that values on the smoothed curve are <strong>not the raw measured data</strong>. They represent a <strong>smoothed trend line</strong> computed from EWMA, intended to reduce short-term fluctuation and make patterns easier to read.</p></br><p>So the displayed values should be treated as a <strong>visual trend</strong>, not an exact raw value at each timestamp. If you need precise raw points, please refer to the unsmoothed view.</p>', // '<h2 class="text-lg font-bold">关于数据平滑的提示</h2><p>当您开启平滑后，您在统计图中看到的曲线经过<strong>指数加权移动平均 (EWMA)</strong> 算法处理，这是一种常用的数据平滑技术。</p></br><p>需要注意的是，经过EWMA算法平滑后的曲线所展示的数值，<strong>并非原始的、真实的测量数据</strong>。它们是根据EWMA算法计算得出的一个<strong>平滑趋势线</strong>，旨在减少数据波动，使数据模式和趋势更容易被识别。</p></br><p>因此，您看到的数值更像是<strong>视觉上的呈现</strong>，帮助您更好地理解数据的整体走向和长期趋势，而不是每一个时间点的精确真实值。如果您需要查看具体、原始的数据点，请参考未经平滑处理的数据视图。</p>'
    connectBreaksTooltipContent:
      '<h2 class="text-lg font-bold">About Connect Breaks</h2><p><strong>Disabled by default and configurable in admin.</strong></p><p>When Connect Breaks is enabled, lines in the chart will bridge over packet-loss points caused by network issues or other disruptions, so the trend remains continuous. The system will also draw <strong>semi-transparent vertical guide lines</strong> at those break points.</p>', // '<h2 class="text-lg font-bold">关于连接断点的提示</h2><p><strong>默认关闭，可在后台配置</strong></p><p>当您开启"连接断点"功能后，图表中的曲线将会跨过那些由于网络问题或其他原因导致的丢包点，形成一条连续的线条。同时，系统会在丢包位置显示<strong>半透明的垂直参考线</strong>来标记断点位置。</p>
  },
  setting: {
    title: "Edit Configuration", // 编辑配置
    home: "🏠",
    customUI: "Customise UI", // UI 自定义
    close: "Close", // 关闭
    import: "Import", // 导入
    export: "Export", // 导出
    togglePreview: {
      on: "Disable preview", // 关闭预览
      off: "Enable preview", // 开启预览
    },
    reset: "Reset", // 重置
    save: "Save", // 保存
    back: "Back", // 返回
    unsavedChanges: "You have unsaved changes", // 有未保存的更改
    unsavedChangesDesc: "Configuration has been restored to the last saved state", // 配置已恢复到上次保存的状态
    saveSuccess: "Configuration saved!", // 配置已保存！
    saveError: "Failed to save configuration!", // 保存配置失败！
    resetConfirm: "Are you sure you want to reset all configuration?", // 确定要重置所有配置吗？
    resetConfirmAction: "Confirm", // 确定
    importSuccess: "Import succeeded. Save now?", // 导入成功，是否立即保存？
    importError: "Failed to import configuration!", // 导入配置失败！
    fetchError: "Failed to fetch theme settings config:",
    saveThemeError: "Failed to save theme settings:",
    importConfigError: "Failed to import config:",
    cancel: "Cancel", // 撤销
  },
};
