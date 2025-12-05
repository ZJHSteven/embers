import "./Docs.css";

// 文件用途：提供本地化后的教程页，逐步讲解基础操作与自定义法术流程。
export default function Tutorials() {
    return <div className="docs-container">
        <a href="/" className="subtle-link row">
            <img src="embers.svg" className="docs-title-icon"></img>
            <p className="docs-title">余烬（Embers）</p>
        </a>
        <hr className="docs-divider"></hr>
        <div className="docs-body">
            <p className="docs-subtitle">
                教程
            </p>
            <br></br>
            <p className="docs-subsubtitle">
                基础教程
            </p>
            <p className="docs-p">
                即将上线，敬请期待。
            </p>
            <br></br>
            <p className="docs-subsubtitle">
                法术书教程
            </p>
            <p className="docs-p">
                即将上线，敬请期待。
            </p>
            <br></br>
            <p className="docs-subsubtitle">
                自定义法术教程
            </p>
            <p className="docs-p">
                余烬支持基于现有效果创建自定义法术。打开扩展面板，切换到顶部的「自定义法术」标签，点击旁边的「+」按钮开始。
            </p>
            <img src="custom-spells-1.png" style={{maxWidth: "90vw"}}></img>
            <p className="docs-p">
                「自定义法术」后第一枚按钮用于新增空白法术；第二枚按钮可基于现有法术复制修改；第三、四枚按钮分别导入/导出自定义法术列表；最后一枚为清空，请谨慎使用。
            </p>
            <br></br>
            <p className="docs-p">
                编辑法术时会看到如下界面：
            </p>
            <img src="custom-spells-2.png" style={{maxWidth: "90vw"}}></img>
            <p className="docs-p">
                起始字段较直观：填写法术名称与唯一 ID，并设定目标数的最小/最大限制。
            </p>
            <p className="docs-p">
                「复制模式」用于描述多目标时的播放方式：
            </p>
            <ul>
                <li><p className="docs-p">选择「无」时，法术可获取完整目标数组，由你在蓝图中自行处理。</p></li>
                <li><p className="docs-p">选择「全部」时，目标数组只含一个元素，但会对每个目标重复播放。</p></li>
                <li><p className="docs-p">选择「起点到其他」时，数组首位固定为第一个目标，第二位为当前目标，用于「从施法者到每个目标」的场景。</p></li>
            </ul>
            <p className="docs-p">
                例如：「祈福」适合「全部」模式；「魔法飞弹」适合「起点到其他」。
            </p>
            <br></br>
            <p className="docs-p">
                「复制间隔」控制多次播放的延迟；未填写则重复选中同一目标不会增加次数，负数表示同时生成全部实例。
            </p>
            <br></br>
            <p className="docs-p">
                设置完基础参数后，点击「蓝图」后的「+」新增效果或动作；下拉可切换类型，垃圾桶删除，铅笔编辑。
            </p>
            <img src="custom-spells-3.png" style={{maxWidth: "90vw"}}></img>
            <p className="docs-p">
                编辑效果时可配置：
            </p>
            <ul>
                <li><p className="docs-p">效果 ID：要播放的效果标识，完整列表见<a href="/listings">素材清单</a>。</p></li>
                <li><p className="docs-p">延迟：自法术开始到播放该效果的毫秒数。</p></li>
                <li><p className="docs-p">持续时间：播放时长；留空按原动画；负数为无限循环。</p></li>
                <li><p className="docs-p">循环次数：播放次数；与持续时间互斥。</p></li>
                <li><p className="docs-p">禁用：为真时跳过该效果。</p></li>
                <li><p className="docs-p">禁用点击：为真时无法点选该效果实例。</p></li>
                <li><p className="docs-p">附着对象：填入要附着的物件 ID，留空则不附着。</p></li>
                <li><p className="docs-p">图层：效果播放所在的图层。</p></li>
            </ul>
            <p className="docs-p">
                不同效果类型还会有额外字段，按需填写。
            </p>
            <br></br>
            <p className="docs-p">
                数值编辑支持字面量、变量或函数三种模式：可直接填入数字/布尔，也可引用 <span className="code">targets</span> 或 <span className="code">globalTargets</span>（含 id/size/position/count），或选择函数并按需填参数（函数签名详见<a href="/listings">清单</a>）。
            </p>
            <p className="docs-p">
                动作编辑方式与函数一致。
            </p>
        </div>
    </div>;
}
