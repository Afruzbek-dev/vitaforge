const fs = require('fs');
const path = require('path');

const mappings = {
  'api.users.me()': 'UserService.getMe()',
  'api.users.stats()': 'UserService.getStats()',
  'api.auth.login(data.email, data.password)': 'AuthService.login(data.email, data.password)',
  'api.auth.register(data)': 'AuthService.register(data)',
  'api.admin.overview()': 'AdminService.getOverview()',
  'api.admin.exportReport()': 'AdminService.exportReport()',
  'api.admin.aiUsage()': 'AdminService.getAiUsage()',
  'api.admin.billing()': 'AdminService.getBilling()',
  'api.admin.copilot()': 'CopilotService.getMessages("admin")',
  'api.admin.gyms()': 'AdminService.getGyms()',
  
  'api.gym.challenge()': 'GymService.getChallenge()',
  'api.gym.createChallenge(': 'GymService.createChallenge(',
  'api.gym.copilotMessages()': 'CopilotService.getMessages("gym")',
  'api.gym.sendCopilotMessage(': 'CopilotService.sendMessage("gym", ',
  'api.gym.members()': 'GymService.getMembers()',
  'api.gym.checkIn(': 'GymService.checkIn(',
  'api.gym.sendMessage(': 'GymService.sendMessage(',
  'api.gym.settings()': 'GymService.getSettings()',
  'api.gym.updateSettings(': 'GymService.updateSettings(',
  'api.gym.churnRisk()': 'GymService.getDeepChurnAnalysis()',
  'api.gym.retention()': 'GymService.getRetentionAnalytics()',
  'api.gym.analyticsSummary()': 'GymService.getAnalyticsSummary()',
  'api.gym.revenueDynamics()': 'GymService.getRevenueDynamics()',
  'api.gym.memberGrowth()': 'GymService.getMemberGrowth()',
  'api.gym.activityDistribution()': 'GymService.getActivityDistribution()',

  'api.trainer.today()': 'TrainerService.getToday()',
  'api.trainer.addSession()': 'TrainerService.addSession()',
  'api.trainer.analytics()': 'TrainerService.getAnalytics()',
  'api.trainer.clients()': 'TrainerService.getClients()',
  'api.trainer.copilot()': 'CopilotService.getMessages("trainer")',
  'api.trainer.sendMessage(': 'CopilotService.sendMessage("trainer", ',
  'api.trainer.schedule()': 'TrainerService.getSchedule()',

  'api.food.getLog()': 'NutritionService.getLogForDate()',
  'api.food.parse(': 'NutritionService.parseFoodText(',

  'api.plans.current()': 'FitnessPlanService.getCurrentPlan()',
  'api.plans.generate()': 'FitnessPlanService.generatePlan()',

  'api.leaderboard.get()': 'LeaderboardService.getTopUsers()',

  'api.notifications.list()': 'NotificationService.getLogForDate()', // generic
  
  'api.onboarding.saveProfile(': 'OnboardingService.saveProfile('
};

// Which service class handles which object?
const serviceImports = {
  'UserService': '@/lib/services/UserService',
  'AuthService': '@/lib/services/AuthService',
  'AdminService': '@/lib/services/AdminService',
  'CopilotService': '@/lib/services/CopilotService',
  'GymService': '@/lib/services/GymService',
  'TrainerService': '@/lib/services/TrainerService',
  'NutritionService': '@/lib/services/NutritionService',
  'FitnessPlanService': '@/lib/services/FitnessPlanService',
  'LeaderboardService': '@/lib/services/LeaderboardService',
  'NotificationService': '@/lib/services/NotificationService',
  'OnboardingService': '@/lib/services/OnboardingService'
};

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      callback(p);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  let neededServices = new Set();

  for (let [search, replace] of Object.entries(mappings)) {
    if (content.includes(search)) {
      content = content.split(search).join(replace);
      const serviceName = replace.split('.')[0];
      neededServices.add(serviceName);
    }
  }
  
  // also handle dynamic destructurings or unwrappings 
  // e.g. return res.data -> return res
  // because services just return data. But let's leave that to a separate pass if needed, 
  // or fix it here:
  // Usually it was: `const res = await api.admin.overview(); return res.data;`
  // But now AdminService.getOverview() returns the object directly.
  content = content.replace(/const (\w+) = (await [A-Za-z]+Service\.\w+\(.*?\));\s*return \1\.data;/g, "const $1 = $2;\n      return $1;");
  // Also inside useQuery:
  // `const res = await api.trainer.today(); return res.data;` is matched above.
  // Sometimes: `return (await api.users.me()).data`
  content = content.replace(/return \(await ([A-Za-z]+Service\.[^\)]+)\)\.data/g, "return await $1");
  
  if (neededServices.size > 0 && content.includes('import { api } from "@/lib/api"')) {
    content = content.replace('import { api } from "@/lib/api";\n', '');
    content = content.replace('import { api } from "@/lib/api"\n', '');
    content = content.replace('import { api } from "@/lib/api";', '');
    
    let imports = '';
    for (let service of neededServices) {
      if (serviceImports[service]) {
        imports += `import { ${service} } from "${serviceImports[service]}";\n`;
      }
    }
    
    // insert imports after 'use client'
    if (content.includes('"use client";')) {
      content = content.replace('"use client";\n', `"use client";\n${imports}`);
    } else {
      content = imports + content;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

walk(path.join(__dirname, 'components'), processFile);
