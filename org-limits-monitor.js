'use strict';

const jsforce = require('jsforce');
const http = require("http");
const express = require("express");

const DEFAULT_USER_CONFIG_PATH = './user_config.yaml';
const COMMAND_OPTION_SILENT_MODE = '-s';
const COMMAND_OPTION_HELP = '-h';
const COMMAND_OPTION_CONFIG = '-c';

const LIMIT_ITEM_ARRAY = [
  'ActiveScratchOrgs.Remaining', 'ActiveScratchOrgs.Max',
  'AnalyticsExternalDataSizeMB.Remaining', 'AnalyticsExternalDataSizeMB.Max',
  'ConcurrentAsyncGetReportInstances.Remaining', 'ConcurrentAsyncGetReportInstances.Max',
  'ConcurrentEinsteinDataInsightsStoryCreation.Remaining', 'ConcurrentEinsteinDataInsightsStoryCreation.Max',
  'ConcurrentEinsteinDiscoveryStoryCreation.Remaining', 'ConcurrentEinsteinDiscoveryStoryCreation.Max',
  'ConcurrentSyncReportRuns.Remaining', 'ConcurrentSyncReportRuns.Max',
  'DailyAnalyticsDataflowJobExecutions.Remaining', 'DailyAnalyticsDataflowJobExecutions.Max',
  'DailyAnalyticsUploadedFilesSizeMB.Remaining', 'DailyAnalyticsUploadedFilesSizeMB.Max',
  'DailyApiRequests.Remaining', 'DailyApiRequests.Max',
  'DailyAsyncApexExecutions.Remaining', 'DailyAsyncApexExecutions.Max',
  'DailyAsyncApexTests.Remaining', 'DailyAsyncApexTests.Max',
  'DailyBulkApiBatches.Remaining', 'DailyBulkApiBatches.Max',
  'DailyBulkV2QueryFileStorageMB.Remaining', 'DailyBulkV2QueryFileStorageMB.Max',
  'DailyBulkV2QueryJobs.Remaining', 'DailyBulkV2QueryJobs.Max',
  'DailyDeliveredPlatformEvents.Remaining', 'DailyDeliveredPlatformEvents.Max',
  'DailyDurableGenericStreamingApiEvents.Remaining', 'DailyDurableGenericStreamingApiEvents.Max',
  'DailyDurableStreamingApiEvents.Remaining', 'DailyDurableStreamingApiEvents.Max',
  'DailyEinsteinDataInsightsStoryCreation.Remaining', 'DailyEinsteinDataInsightsStoryCreation.Max',
  'DailyEinsteinDiscoveryPredictAPICalls.Remaining', 'DailyEinsteinDiscoveryPredictAPICalls.Max',
  'DailyEinsteinDiscoveryPredictionsByCDC.Remaining', 'DailyEinsteinDiscoveryPredictionsByCDC.Max',
  'DailyEinsteinDiscoveryStoryCreation.Remaining', 'DailyEinsteinDiscoveryStoryCreation.Max',
  'DailyGenericStreamingApiEvents.Remaining', 'DailyGenericStreamingApiEvents.Max',
  'DailyScratchOrgs.Remaining', 'DailyScratchOrgs.Max',
  'DailyStandardVolumePlatformEvents.Remaining', 'DailyStandardVolumePlatformEvents.Max',
  'DailyStreamingApiEvents.Remaining', 'DailyStreamingApiEvents.Max',
  'DailyWorkflowEmails.Remaining', 'DailyWorkflowEmails.Max',
  'DataStorageMB.Remaining', 'DataStorageMB.Max',
  'DurableStreamingApiConcurrentClients.Remaining', 'DurableStreamingApiConcurrentClients.Max',
  'FileStorageMB.Remaining', 'FileStorageMB.Max',
  'HourlyAsyncReportRuns.Remaining', 'HourlyAsyncReportRuns.Max',
  'HourlyDashboardRefreshes.Remaining', 'HourlyDashboardRefreshes.Max',
  'HourlyDashboardResults.Remaining', 'HourlyDashboardResults.Max',
  'HourlyDashboardStatuses.Remaining', 'HourlyDashboardStatuses.Max',
  'HourlyLongTermIdMapping.Remaining', 'HourlyLongTermIdMapping.Max',
  'HourlyManagedContentPublicRequests.Remaining', 'HourlyManagedContentPublicRequests.Max',
  'HourlyODataCallout.Remaining', 'HourlyODataCallout.Max',
  'HourlyPublishedPlatformEvents.Remaining', 'HourlyPublishedPlatformEvents.Max',
  'HourlyPublishedStandardVolumePlatformEvents.Remaining', 'HourlyPublishedStandardVolumePlatformEvents.Max',
  'HourlyShortTermIdMapping.Remaining', 'HourlyShortTermIdMapping.Max',
  'HourlySyncReportRuns.Remaining', 'HourlySyncReportRuns.Max',
  'HourlyTimeBasedWorkflow.Remaining', 'HourlyTimeBasedWorkflow.Max',
  'MassEmail.Remaining', 'MassEmail.Max',
  'MonthlyEinsteinDiscoveryStoryCreation.Remaining', 'MonthlyEinsteinDiscoveryStoryCreation.Max',
  'MonthlyPlatformEventsUsageEntitlement.Remaining', 'MonthlyPlatformEventsUsageEntitlement.Max',
  'Package2VersionCreates.Remaining', 'Package2VersionCreates.Max',
  'Package2VersionCreatesWithoutValidation.Remaining', 'Package2VersionCreatesWithoutValidation.Max',
  'PermissionSets.Remaining', 'PermissionSets.Max',
  'PrivateConnectOutboundCalloutHourlyLimitMB.Remaining', 'PrivateConnectOutboundCalloutHourlyLimitMB.Max',
  'SingleEmail.Remaining', 'SingleEmail.Max',
  'StreamingApiConcurrentClients.Remaining', 'StreamingApiConcurrentClients.Max'
];
const ITEM_ARRAY_STRING = 'itemArrayString';
const ITEM_REFRESH_DISABLED = 'RefreshDisabled';
const ITEM_AUTO_REFRESH_CHECKED = 'AutoRefreshChecked';
const ITEM_AUTO_REFRESH_INTERVAL = 'AutoRefreshInterval';
const ITEM_SCROLL_X = 'ScrollX';
const ITEM_SCROLL_Y = 'ScrollY';
const ITEM_FONT_SIZE = 'FontSize';
const ITEM_FONT_SMALL_BUTTON_CHECKED = 'FontSmallButtonChecked';
const ITEM_FONT_MIDDLE_BUTTON_CHECKED = 'FontMiddleButtonChecked';
const ITEM_FONT_LARGE_BUTTON_CHECKED = 'FontLargeButtonChecked';
const FONT_SMALL = 'font_small';
const FONT_MIDDLE = 'font_middle';
const FONT_LARGE = 'font_large';
const CONFIG_FONT_SMALL = 0;
const CONFIG_FONT_MIDDLE = 1;
const CONFIG_FONT_LARGE = 2;

// default parameter
global.enabledLogging = true;
let userConfigPath = DEFAULT_USER_CONFIG_PATH;
let listenPort = 3000;
let itemMap = new Map();
let isAutoRefresh = false;
let autoRefreshInterval = 10000;
let scrollX = 0;
let scrollY = 0;
let fontSize = FONT_LARGE;
let limitItemSet = new Set();
LIMIT_ITEM_ARRAY.forEach((val) => {limitItemSet.add(val)});

// analyzes command line options
let paramList = [];
let paramCnt = 0;
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === COMMAND_OPTION_SILENT_MODE) {
    global.enabledLogging = false;
  } else if (process.argv[i] === COMMAND_OPTION_CONFIG) {
    if (i + 1 >= process.argv.length) {
      usage();
    }
    userConfigPath = process.argv[i + 1];
  } else if (process.argv[i] === COMMAND_OPTION_HELP) {
    usage();
  } else {
    paramList.push(process.argv[i]);
  }
}

loadUserConfig(userConfigPath);
let userConfig = global.userConfig;
if (userConfig.autoRefreshInterval && !isNaN(userConfig.autoRefreshInterval)) {
  if (userConfig.autoRefreshInterval > 0) {
    autoRefreshInterval = userConfig.autoRefreshInterval * 1000;
  }
}
if (!isNaN(userConfig.fontSize)) {
  if (userConfig.fontSize === CONFIG_FONT_SMALL) fontSize = FONT_SMALL;
  if (userConfig.fontSize === CONFIG_FONT_MIDDLE) fontSize = FONT_MIDDLE;
  if (userConfig.fontSize === CONFIG_FONT_LARGE) fontSize = FONT_LARGE;
}
if (userConfig.listenPort && !isNaN(userConfig.listenPort)) {
  listenPort = userConfig.listenPort;
}

let conn = new jsforce.Connection({loginUrl: userConfig.loginUrl, version: userConfig.apiVersion});
(async () => {
  // login to salesforce
  logging('Settings:');
  logging('  LoginUrl:' + userConfig.loginUrl);
  logging('  ApiVersion:' + userConfig.apiVersion);
  logging('  UserName:' + userConfig.userName);
  logging('  AutoRefreshInterval:' + autoRefreshInterval / 1000);
  logging('  FontSize:' + fontSize);
  logging('  ListenPort:' + listenPort);

  await conn.login(userConfig.userName, userConfig.password, function (err, userInfo) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  let app = express();
  app.set("view engine", "ejs");
  app.set("views", "files");
  
  app.get("/", async function (req, res) {
    scrollY = Number(req.query.scroll_y);
    await getItems();
    return res.render("index", Object.fromEntries(itemMap));
  });
  
  app.get("/autorefresh", async function (req, res) {
    if (req.query.enabled === 'true') {
      isAutoRefresh = true;
    } else {
      isAutoRefresh = false;
    }
    scrollX = Number(req.query.scroll_x);
    scrollY = Number(req.query.scroll_y);

    await getItems();
    return res.render("index", Object.fromEntries(itemMap));
  });

  app.get("/fontchange", async function (req, res) {
    let fontSizeWork = req.query.font_size;
    if (fontSizeWork === FONT_SMALL || fontSizeWork === FONT_MIDDLE || fontSizeWork === FONT_LARGE) {
      fontSize = fontSizeWork;
    }
    await getItems();
    return res.render("index", Object.fromEntries(itemMap));
  });

  var server = http.createServer(app);
  server.listen(listenPort);
})();

async function getItems() {
  let limitJson = null;
  await conn.limits(function (err, result) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else if (result) {
      limitJson = result;
    }
  })
  let limitObj = JSON.parse(JSON.stringify(limitJson))

  let itemArrayString = '';
  LIMIT_ITEM_ARRAY.forEach((val) => {
    let valArray = val.split('.');
    let key = valArray[0] + valArray[1];
    let limitVal = '';
    if (limitObj[valArray[0]][valArray[1]] || limitObj[valArray[0]][valArray[1]] === 0) {
      limitVal = limitObj[valArray[0]][valArray[1]];
    }
    if (itemMap.has(key)) {
      if (itemMap.get(key) !== limitVal) {
        itemArrayString += '\'' + key + '\',';
        itemMap.set(key, limitVal);
      }
    } else {
      itemMap.set(key, limitVal);
    }
  });
  if (itemArrayString) {
    itemArrayString = itemArrayString.slice(0, -1);
  }
  itemMap.set(ITEM_ARRAY_STRING, itemArrayString);

  for (var item in limitObj) {
    if (!limitItemSet.has(item + '.Remaining') || !limitItemSet.has(item + '.Max')) {
      logging('Unknown limit item: ' + item);
    }
  }

  if (isAutoRefresh) {
    itemMap.set(ITEM_AUTO_REFRESH_CHECKED, 'checked');
    itemMap.set(ITEM_REFRESH_DISABLED, 'disabled');
  } else {
    itemMap.set(ITEM_AUTO_REFRESH_CHECKED, '');
    itemMap.set(ITEM_REFRESH_DISABLED, '');
  }
  itemMap.set(ITEM_AUTO_REFRESH_INTERVAL, autoRefreshInterval);

  itemMap.set(ITEM_SCROLL_X, scrollX);
  itemMap.set(ITEM_SCROLL_Y, scrollY);

  itemMap.set(ITEM_FONT_SIZE, fontSize);
  if (fontSize === FONT_SMALL) {
    itemMap.set(ITEM_FONT_SMALL_BUTTON_CHECKED, 'checked');
    itemMap.set(ITEM_FONT_MIDDLE_BUTTON_CHECKED, '');
    itemMap.set(ITEM_FONT_LARGE_BUTTON_CHECKED, '');
  } else if (fontSize === FONT_MIDDLE) {
    itemMap.set(ITEM_FONT_SMALL_BUTTON_CHECKED, '');
    itemMap.set(ITEM_FONT_MIDDLE_BUTTON_CHECKED, 'checked');
    itemMap.set(ITEM_FONT_LARGE_BUTTON_CHECKED, '');
  } else {
    itemMap.set(ITEM_FONT_SMALL_BUTTON_CHECKED, '');
    itemMap.set(ITEM_FONT_MIDDLE_BUTTON_CHECKED, '');
    itemMap.set(ITEM_FONT_LARGE_BUTTON_CHECKED, 'checked');
  }

}

function usage() {
  console.log('usage: org-limits-monitor.js [-options]');
  console.log('    -c <pathname> specifies a config file path (default is ./user_config.yaml)');
  console.log('    -s            silent mode');
  console.log('    -h            display this help');
  process.exit(0);
}

function loadYamlFile(fileName) {
  const fs = require('fs');
  let existsFile = fs.existsSync(fileName);
  if (!existsFile) {
    console.error('File not found. filePath: ' + fileName);
    process.exit(1);
  }
  const yaml = require('js-yaml');
  const yamlText = fs.readFileSync(fileName, 'utf8');
  return yaml.load(yamlText);
}

function loadUserConfig(userConfigPath) {
  let userConfigPathWork = userConfigPath;
  if (userConfigPathWork === undefined) {
    userConfigPathWork = DEFAULT_USER_CONFIG_PATH;
  }
  const path = require('path');
  const config = loadYamlFile(path.join(__dirname, userConfigPathWork));
  global.userConfig = config;
}

function logging(message) {
  if (global.enabledLogging) {
    const nowDate = new Date();
    console.log('[' + getFormattedDateTime(nowDate) + '] ' + message);
  }
}

function getFormattedDateTime(date) {
  let dateString =
    date.getFullYear() + '/' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '/' +
    ('0' + date.getDate()).slice(-2) + ' ' +
    ('0' + date.getHours()).slice(-2) + ':' +
    ('0' + date.getMinutes()).slice(-2) + ':' +
    ('0' + date.getSeconds()).slice(-2);
  return dateString;
}
