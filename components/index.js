// import Data from '../dev/Data.js'
import Data from '../system/Data.js'
import file from './file.js'
import Path from './Path.js'
import UCDate from './UCDate.js'
import Check from './Check.js'
import common from './common.js'
import Admin from './Admin.js'
import UCPr from './UCPr.js'
import _log from './log.js'

const log = new _log(UCPr, Path, Data.addLog.bind(Data, Path.errorLogjson))

export { Path, Check, Data, UCDate, common, Admin, file, log, UCPr, _log }