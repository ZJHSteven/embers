import "./Docs.css";

import { effectNames, getEffect } from "../effects";

import { Effect } from "../types/effects";
import { actions } from "../effects/actions";
import { blueprintFunctions } from "../effects/blueprintFunctions";

// 文件用途：展示可用的函数、动作与效果清单，方便自定义法术时查找标识符和参数。
const types = {
    "CIRCLE": "范围",
    "TARGET": "投射物",
    "CONE": "锥形",
    "WALL": "墙体"
};

export default function Listings() {
    return <div className="docs-container">
        <a href="/" className="subtle-link row">
            <img src="embers.svg" className="docs-title-icon"></img>
            <p className="docs-title">余烬（Embers）</p>
        </a>
        <hr className="docs-divider"></hr>
        <div className="docs-body">
        <p className="docs-subtitle">
                清单
            </p>
            <p className="docs-p">
                此页列出所有素材、蓝图函数以及动作，创建自定义法术时可直接查阅。
            </p>
            <br></br>
            <p className="docs-subsubtitle">
                函数
            </p>
            <div>
                {
                    Object.entries(blueprintFunctions).map(([functionName, func]) => {
                        return <div key={functionName}>
                            <p className="bold docs-p">{ functionName }</p>
                            <p className="docs-p">{ func.desc.description ?? "" }</p>
                            <ul>
                                {
                                    func.desc.minArgs == func.desc.maxArgs && func.desc.minArgs != undefined &&
                                    <li>
                                        <p className="docs-p">
                                            参数数量：{ func.desc.minArgs }
                                        </p>
                                    </li>
                                }
                                {
                                    func.desc.minArgs != func.desc.maxArgs && func.desc.minArgs != undefined &&
                                    <li>
                                        <p className="docs-p">
                                            最少参数：{ func.desc.minArgs }
                                        </p>
                                    </li>
                                }
                                {
                                    func.desc.minArgs != func.desc.maxArgs && func.desc.maxArgs != undefined &&
                                    <li>
                                        <p className="docs-p">
                                            最多参数：{ func.desc.maxArgs }
                                        </p>
                                    </li>
                                }
                                {
                                    func.desc.argumentType &&
                                    <li>
                                        <p className="docs-p">
                                            参数类型：<span style={{fontStyle: "italic"}}>{ func.desc.argumentType }</span>
                                        </p>
                                    </li>
                                }
                                {
                                    func.desc.returnType &&
                                    <li>
                                        <p className="docs-p">
                                            返回类型：<span style={{fontStyle: "italic"}}>{ func.desc.returnType }</span>
                                        </p>
                                    </li>
                                }
                            </ul>
                        </div>;
                    })
                }
            </div>
            <br></br>
            <p className="docs-subsubtitle">
                动作
            </p>
            <div>
                {
                    Object.entries(actions).map(([actionName, action]) => {
                        return <div key={actionName}>
                            <p className="bold docs-p">{ actionName }</p>
                            <p className="docs-p">{ action.desc.description ?? "" }</p>
                            <ul>
                                {
                                    action.desc.minArgs == action.desc.maxArgs && action.desc.minArgs != undefined &&
                                    <li>
                                        <p className="docs-p">
                                            参数数量：{ action.desc.minArgs }
                                        </p>
                                    </li>
                                }
                                {
                                    action.desc.minArgs != action.desc.maxArgs && action.desc.minArgs != undefined &&
                                    <li>
                                        <p className="docs-p">
                                            最少参数：{ action.desc.minArgs }
                                        </p>
                                    </li>
                                }
                                {
                                    action.desc.minArgs != action.desc.maxArgs && action.desc.maxArgs != undefined &&
                                    <li>
                                        <p className="docs-p">
                                            最多参数：{ action.desc.maxArgs }
                                        </p>
                                    </li>
                                }
                                {
                                    action.desc.argumentType &&
                                    <li>
                                        <p className="docs-p">
                                            参数类型：<span style={{fontStyle: "italic"}}>{ action.desc.argumentType }</span>
                                        </p>
                                    </li>
                                }
                            </ul>
                        </div>;
                    })
                }
            </div>
            <br></br>
            <p className="docs-subsubtitle">
                效果
            </p>
            <table>
                <thead>
                    <tr>
                        <th>效果 ID</th>
                        <th>类型</th>
                        <th>持续时间</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        effectNames.map(effectName => [effectName, getEffect(effectName)]).map(([effectID, effect]) => {
                            const durations = Object.values((effect as Effect).variants).map(variant => Math.max(...variant.duration));
                            return <tr key={effectID as string}>
                                <td style={{textAlign: "left"}}>{ effectID as string }</td>
                                <td>{ types[(effect as Effect).type as (keyof typeof types)]}</td>
                                <td>{ Math.max(...durations) } ms</td>
                            </tr>;
                        })
                    }
                </tbody>
            </table>
        </div>
    </div>;
}
