export type TalkScenario =
  | "关怀"
  | "到期提醒"
  | "到账核对"
  | "犹豫期回访";

export interface TalkTrack {
  id: string;
  scenario: TalkScenario;
  title: string;
  body: string;
  complianceNote: string;
}

const RISK =
  "【合规提示】不得承诺收益或保本；话术仅供参考，需结合客户风险承受能力及产品说明书。";

export const TALK_TRACKS: TalkTrack[] = [
  {
    id: "care-1",
    scenario: "关怀",
    title: "生日祝福（无销售）",
    body: `{姓名} 先生/女士您好，我是XX银行财富经理。祝您生日快乐，感谢一直以来的信任。如您近期有金融服务需求，欢迎预约到行咨询；本次问候不涉及任何产品推介或收益承诺。`,
    complianceNote: RISK,
  },
  {
    id: "care-2",
    scenario: "关怀",
    title: "节日问候",
    body: `{姓名} 您好，{节日}将至，谨致问候。近期天气多变，请注意出行与财产安全。如需账户或到期事项咨询，可回复本消息预约联系时间。`,
    complianceNote: RISK,
  },
  {
    id: "care-3",
    scenario: "关怀",
    title: "久未联系回访",
    body: `{姓名} 您好，例行服务回访：了解您近期资金安排是否顺畅。如有到期或到账疑问，我可协助查询与登记；不向客户推荐具体产品。`,
    complianceNote: RISK,
  },
  {
    id: "expiry-1",
    scenario: "到期提醒",
    title: "到期前 3 日提醒（动作型）",
    body: `您好，我是XX银行财富经理{姓名}。您持有的「{产品名}」（合同/保单号 {合同号}）将于 {到期日} 到期。请您确认资金安排：如需续作或变更，请在到期日前通过官方渠道办理；如有疑问可预约到行面签。本次沟通不构成投资建议。`,
    complianceNote: RISK,
  },
  {
    id: "expiry-2",
    scenario: "到期提醒",
    title: "今日到期跟进",
    body: `{姓名} 先生/女士您好，今日为「{产品名}」到期日。请您关注账户资金变动及后续到账情况；如需办理续期或资金划转，请按行内流程操作。我行不代为承诺任何收益表现。`,
    complianceNote: RISK,
  },
  {
    id: "recon-1",
    scenario: "到账核对",
    title: "到账差异核实",
    body: `{姓名} 您好，系统显示您「{产品名}」到期款项与回执信息存在待核对项（参考号 {回执号}）。请您核对近期短信/网银到账记录，并告知方便回访的时间；我们将协助登记差异说明，不涉及产品推介。`,
    complianceNote: RISK,
  },
  {
    id: "recon-2",
    scenario: "到账核对",
    title: "已到账确认",
    body: `您好，我行已收到「{产品名}」到期相关款项的银行回执（{回执号}）。请您登录官方渠道确认余额；如对金额有疑问，可携带证件到网点查询。`,
    complianceNote: RISK,
  },
  {
    id: "cooling-1",
    scenario: "犹豫期回访",
    title: "犹豫期内风险提示回访",
    body: `{姓名} 您好，就您近期办理的「{产品名}」进行合规回访：请确认您已阅读产品说明书与风险揭示书，了解不保证本金及收益。如需在犹豫期内撤单，请按合同约定时限办理。`,
    complianceNote: RISK,
  },
];

export function fillTalkTrack(
  template: string,
  vars: Record<string, string>
): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, v);
  }
  return out;
}
