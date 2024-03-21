import { common, Data, UCPr } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import fetch from 'node-fetch'

const opCharacter = ['派蒙', '纳西妲', '凯亚', '温迪', '荒泷一斗', '娜维娅', '阿贝多', '钟离', '枫原万叶', '那维莱特', '艾尔海森', '八重神子', '宵宫', '芙宁娜', '迪希雅', '提纳里', '莱依拉', '卡维', '诺艾尔', '赛诺', '林尼', '莫娜', '托马', '神里绫华', '凝光', '北斗', '可莉', '柯莱', '迪奥娜', '莱欧斯利', '芭芭拉', '雷电将军', '珊瑚宫心海', '魈', '五郎', '胡桃', '鹿野院平藏', '安柏', '琴', '重云', '达达利亚', '班尼特', '夜兰', '丽莎', '香菱', '妮露', '刻晴', '珐露珊', '烟绯', '辛焱', '早柚', '迪卢克', '砂糖', '云堇', '久岐忍', '神里绫人', '优菈', '甘雨', '夏洛蒂', '流浪者', '行秋', '夏沃蕾', '戴因斯雷布', '闲云', '白术', '菲谢尔', '申鹤', '九条裟罗', '雷泽', '荧', '空', '嘉明', '菲米尼', '多莉', '迪娜泽黛', '琳妮特', '凯瑟琳', '米卡', '坎蒂丝', '萍姥姥', '罗莎莉亚', '埃德', '爱贝尔', '伊迪娅', '留云借风真君', '瑶瑶', '绮良良', '七七', '式大将', '奥兹', '泽维尔', '哲平', '大肉丸', '托克', '蒂玛乌斯', '昆钧', '欧菲妮', '仆人', '塞琉斯', '言笑', '迈勒斯', '希格雯', '拉赫曼', '阿守', '杜拉夫', '阿晃', '旁白', '克洛琳德', '伊利亚斯', '爱德琳', '埃洛伊', '远黛', '德沃沙克', '玛乔丽', '劳维克', '塞塔蕾', '海芭夏', '九条镰治', '柊千里', '阿娜耶', '千织', '笼钓瓶一心', '回声海螺', '叶德', '卡莉露', '元太', '漱玉', '阿扎尔', '查尔斯', '阿洛瓦', '纳比尔', '莎拉', '迪尔菲', '康纳', '博来', '博士', '玛塞勒', '阿祇', '玛格丽特', '埃勒曼', '羽生田千鹤', '宛烟', '海妮耶', '科尔特', '霍夫曼', '一心传名刀', '弗洛朗', '佐西摩斯', '鹿野奈奈', '舒伯特', '天叔', '艾莉丝', '龙二', '芙卡洛斯', '莺儿', '嘉良', '珊瑚', '费迪南德', '祖莉亚·德斯特雷', '久利须', '嘉玛', '艾文', '女士', '丹吉尔', '天目十五', '白老先生', '老孟', '巴达维', '长生', '拉齐', '吴船长', '波洛', '艾伯特', '松浦', '乐平波琳', '埃泽', '阿圆', '莫塞伊思', '杜吉耶', '百闻', '石头', '阿拉夫', '博易', '斯坦利', '迈蒙', '掇星攫辰天君', '毗伽尔', '花角玉将', '恶龙', '知易', '恕筠', '克列门特', '西拉杰', '上杉', '大慈树王', '常九爷', '阿尔卡米', '沙扎曼', '田铁嘴', '克罗索', '悦', '阿巴图伊', '阿佩普', '埃尔欣根', '萨赫哈蒂', '塔杰·拉德卡尼', '安西', '埃舍尔', '萨齐因']
const srCharacter = ['三月七', '陌生人', '丹恒', '希儿', '瓦尔特', '希露瓦', '佩拉', '娜塔莎', '布洛妮娅', '穹', '星', '虎克', '素裳', '克拉拉', '符玄', '白露', '杰帕德', '景元', '姬子', '藿藿', '桑博', '流萤', '艾丝妲', '卡芙卡', '黑天鹅', '桂乃芬', '玲可', '托帕', '彦卿', '浮烟', '黑塔', '驭空', '螺丝咕姆', '停云', '镜流', '帕姆', '卢卡', '史瓦罗', '罗刹', '真理医生', '阿兰', '阮•梅', '明曦', '银狼', '青雀', '乔瓦尼', '伦纳德', '公输师傅', '黄泉', '晴霓', '奥列格', '丹枢', '砂金', '尾巴', '寒鸦', '雪衣', '可可利亚', '青镞', '半夏', '银枝', '米沙', '大毫', '霄翰', '信使', '费斯曼', '爱德华医生', '警长', '猎犬家系成员', '绿芙蓉', '金人会长', '维利特', '维尔德', '斯科特', '卡波特', '刃', '岩明', '浣溪']

const reg = new RegExp([...opCharacter, ...srCharacter].join('|'))

export default class UCGenshinvoice extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-genshinvoice',
      dsc: 'genshinvoice语音合成',
      rule: [
        {
          reg: /^#?(UC)?(音色|语音)列表$/i,
          fnc: 'genshinvoiceList'
        },
        {
          reg: /^#?.+说.+/,
          fnc: 'genshinvoice'
        }
      ]
    })
  }

  async genshinvoiceList() {
    if (!this.verifyLevel()) return false
    const title = '语音合成列表如下'
    const msgArr = []
    msgArr.push('原神')
    msgArr.push(Data.makeArrStr(opCharacter))
    msgArr.push('星铁')
    msgArr.push(Data.makeArrStr(srCharacter))
    msgArr.push('语音合成不支持别名哦~\n请使用#角色说+内容来使用语音合成哦~')
    const reply = await common.makeForwardMsg(this.e, msgArr, title)
    return this.reply(reply)
  }

  async genshinvoice() {
    if (this.level < 0) return false
    const [front, msg] = this.msg
      .replace(/#/, '')
      .replace('说', '_U_')
      .split('_U_')
      .map(a => a.trim())
    const wav = await getWavUrl(front, msg)
    if (!wav) return false
    return this.reply(segment.record(wav))
  }

}

UCPr.function.getWavUrl = getWavUrl
async function getWavUrl(str, msg) {
  const speaker = reg.exec(str)?.[0]
  if (!speaker) return false
  const prompt = str.replace(speaker, '') || 'Happy'
  const body = JSON.stringify({
    /** 文本 角色 SDPRatio Noise Noise_W Length Language '' 段间停顿 句间停顿   prompt */
    data: [msg, speaker + '_ZH', 0.5, 0.6, 0.9, 1, 'ZH', true, 1, 0.25, null, prompt, '', 0.7],
    event_data: null,
    fn_index: 0,
    session_hash: 'tbkzfbqb6oj'
  })
  const res = await fetch('https://bv2.firefly.matce.cn/run/predict', {
    body,
    method: 'POST',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    }
  })
  if (!res.ok) return null
  const data = (await res.json()).data[1]
  return `https://bv2.firefly.matce.cn/file=${data.name}`
}