import "./Docs.css";

// 文件用途：呈现余烬（Embers）扩展的简介与导航，便于新用户快速了解文档、教程与素材列表。
export default function Docs() {
    return <div className="docs-container">
        <a href="/" className="subtle-link row">
            <img src="embers.svg" className="docs-title-icon"></img>
            <p className="docs-title">余烬（Embers）</p>
        </a>
        <hr className="docs-divider"></hr>
        <div className="docs-body">
            <p className="docs-p">
                余烬是一款 Owlbear Rodeo 扩展，用于在战斗地图中播放动画化的法术与职业能力特效。
                所有动画素材由 <a href="https://jb2a.com/">JB2A</a> 在 CC BY-NC-SA 协议下提供（查看<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">许可详情</a>）。
                同时感谢 <a href="https://github.com/aaajii">Aji Banawan</a> 对界面设计的贡献。
            </p>
            <br></br>
            <p className="docs-p">
                本地页面包含 API 说明（供其他 OBR 扩展联动）、使用教程，以及素材/函数/动作清单，方便查找与复用：
            </p>
            <br></br>
            <ul>
                <li>
                    <p className="docs-p">
                        <a href="/tutorials">
                            教程
                        </a>
                    </p>
                </li>
                <li>
                    <p className="docs-p">
                        <a href="/listings">素材、函数与动作清单</a>
                    </p>
                </li>
                <li>
                    <p className="docs-p">
                        Embers API（即将提供）
                    </p>
                </li>
            </ul>
            <br></br>
            <p className="docs-p">
                本地化仓库：<a href="https://github.com/ZJHSteven/embers">ZJHSteven/embers</a>。
                如发现问题或有功能建议，欢迎在仓库提 Issue，或加入 <a href="https://discord.gg/u5RYMkV98s">Owlbear Rodeo 官方 Discord</a> 交流。
            </p>
        </div>
    </div>;
}
