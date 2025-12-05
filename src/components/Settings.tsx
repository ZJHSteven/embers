import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, Fade, Typography } from "@mui/material";
import OBR, { GridScale, Theme, isImage } from "@owlbear-rodeo/sdk";
import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable react-refresh/only-export-components */
import { APP_KEY } from "../config";
import { SimplifiedItem } from "../types/misc";
import { useOBR } from "../react-obr/providers";

// 文件说明：设置面板，分为本地与 GM 全局设置，涵盖默认施法者、网格缩放、权限与召唤物归属等选项，已汉化所有标签与提示。
export const LOCAL_STORAGE_KEYS = {
    MOST_RECENT_SPELLS_LIST_SIZE: "most-recent-list",
    GRID_SCALING_FACTOR: "grid-scaling-factor",
    KEEP_SELECTED_TARGETS: "keep-selected-targets",
    DEFAULT_CASTER: "default-caster",
    ANIMATION_UPDATE_RATE: "animation-update-rate",
};

export const GLOBAL_STORAGE_KEYS = {
    PLAYERS_CAN_CAST_SPELLS: "players-cast-spells",
    SUMMONED_ENTITIES_RULE: "summoned-entities"
};

export const SETTINGS_CHANNEL = `${APP_KEY}/settings`;

const DEFAULT_VALUES = {
    [LOCAL_STORAGE_KEYS.MOST_RECENT_SPELLS_LIST_SIZE]: 10,
    [LOCAL_STORAGE_KEYS.GRID_SCALING_FACTOR]: null,
    [LOCAL_STORAGE_KEYS.KEEP_SELECTED_TARGETS]: true,
    [LOCAL_STORAGE_KEYS.DEFAULT_CASTER]: [],
    [LOCAL_STORAGE_KEYS.ANIMATION_UPDATE_RATE]: 50,
    [GLOBAL_STORAGE_KEYS.PLAYERS_CAN_CAST_SPELLS]: true,
    [GLOBAL_STORAGE_KEYS.SUMMONED_ENTITIES_RULE]: "caster",
}

const GRID_UNIT_FACTORS: Record<string, number> = {
    "ft": 1,
    "m": 1.524,
}

type ModalType = "choose-caster-type";

function parseGridScale(raw: string): GridScale {
    const regexMatch = raw.match(/(\d*)(\.\d*)?([a-zA-Z]*)/);
    if (regexMatch) {
        const multiplier = parseFloat(regexMatch[1]);
        const digits = parseFloat(regexMatch[2]);
        const unit = regexMatch[3] || "";
        if (!isNaN(multiplier) && !isNaN(digits)) {
            return {
                raw,
                parsed: {
                    multiplier: multiplier + digits,
                    unit,
                    digits: regexMatch[2].length - 1
                }
            };
        }
        if (!isNaN(multiplier) && isNaN(digits)) {
            return { raw, parsed: { multiplier, unit, digits: 0 } };
        }
    }
    return { raw, parsed: { multiplier: 1, unit: "", digits: 0 } };
}

function tryComputeGridScaling(gridScale: GridScale | null) {
    if (gridScale == null) {
        return null;
    }
    const gridScaleFactor = gridScale.parsed.multiplier;
    const unitFactor = GRID_UNIT_FACTORS[gridScale.parsed.unit] ?? 1;
    return 5 / (gridScaleFactor * unitFactor);
}

export async function getDefaultGridScaleFactor() {
    const gridScale = await OBR.scene.grid.getScale();
    return tryComputeGridScaling(gridScale) ?? 1;
}

export function getSettingsValue(key: string) {
    const settingsObjectString = localStorage.getItem(`${APP_KEY}/settings`);
    if (settingsObjectString == undefined) {
        return DEFAULT_VALUES[key];
    }
    const settingsObject = JSON.parse(settingsObjectString);
    if (settingsObject[key] == undefined) {
        return DEFAULT_VALUES[key];
    }
    return settingsObject[key];
}

export function setSettingsValue(key: string, value: unknown) {
    const settingsObjectString = localStorage.getItem(`${APP_KEY}/settings`);
    if (settingsObjectString == undefined) {
        localStorage.setItem(`${APP_KEY}/settings`, JSON.stringify({ [key]: value }));
        return;
    }
    const settingsObject = JSON.parse(settingsObjectString);
    settingsObject[key] = value;
    localStorage.setItem(`${APP_KEY}/settings`, JSON.stringify(settingsObject));
}

export async function getGlobalSettingsValue(key: string) {
    const metadata = await OBR.scene.getMetadata();
    const settingsObject = metadata[`${APP_KEY}/settings/${key}`];
    if (settingsObject == undefined) {
        return DEFAULT_VALUES[key];
    }
    return settingsObject;
}

export async function setGlobalSettingsValue(key: string, value: unknown) {
    await OBR.scene.setMetadata({
        [`${APP_KEY}/settings/${key}`]: value
    });
}

export default function Settings() {
    const obr = useOBR();

    const [mostRecentSize, _setMostRecentSize] = useState<number | null>(null);
    const [gridScalingFactor, _setGridScalingFactor] = useState<number | null | undefined>(undefined);
    const [keepTargets, setKeepTargets] = useState<boolean | null>(null);
    const [playersCastSpells, setPlayersCastSpells] = useState<boolean | null>(null);
    const [summonedEntities, setSummonedEntities] = useState<string | null>(null);
    const [gridScale, setGridScale] = useState<GridScale | null>(null);
    const [defaultCaster, setDefaultCaster] = useState<SimplifiedItem[] | null>(null);
    const [animationRate, _setAnimationRate] = useState<number | null>(null);
    const [modalOpened, setModalOpened] = useState<ModalType | null>(null);
    const [theme, setTheme] = useState<Theme>();
    const mainDiv = useRef<HTMLDivElement>(null);

    const setMostRecentSize = useCallback((size: string) => {
        const recentSize = parseInt(size);
        if (isNaN(recentSize)) {
            _setMostRecentSize(null);
            return;
        }
        _setMostRecentSize(recentSize);
    }, []);

    const setGridScalingFactor = useCallback((factor: string) => {
        const scaleFactor = parseFloat(factor);
        if (isNaN(scaleFactor)) {
            _setGridScalingFactor(null);
            return;
        }
        _setGridScalingFactor(scaleFactor);
    }, []);

    const setAnimationRate = useCallback((rate: string) => {
        const intRate = parseInt(rate);
        if (isNaN(intRate)) {
            _setAnimationRate(null);
            return;
        }
        _setAnimationRate(intRate);
    }, []);

    const handleAssetPicker = useCallback(() => {
        OBR.assets.downloadImages(true).then(selection => {
            if (selection.length > 0) {
                setDefaultCaster(selection);
            }
        })
    }, []);

    const handleSetCasterFromSelection = useCallback(() => {
        OBR.player.getSelection().then(itemIDs => {
            OBR.scene.items.getItems(itemIDs).then(items => {
                const selection = items.filter(item => isImage(item));
                if (selection.length > 0) {
                    setDefaultCaster(selection.map(selected => ({ ...selected, type: "CHARACTER" })));
                }
            })
        });
    }, []);

    const reloadSettings = useCallback(() => {
        _setMostRecentSize(getSettingsValue(LOCAL_STORAGE_KEYS.MOST_RECENT_SPELLS_LIST_SIZE));
        _setGridScalingFactor(getSettingsValue(LOCAL_STORAGE_KEYS.GRID_SCALING_FACTOR));
        _setAnimationRate(getSettingsValue(LOCAL_STORAGE_KEYS.ANIMATION_UPDATE_RATE));
        setKeepTargets(getSettingsValue(LOCAL_STORAGE_KEYS.KEEP_SELECTED_TARGETS));
        setDefaultCaster(getSettingsValue(LOCAL_STORAGE_KEYS.DEFAULT_CASTER));
    }, []);

    const closeModal = () => {
        setModalOpened(null);
    };

    useEffect(() => {
        if (!obr.ready) {
            return;
        }

        OBR.theme.getTheme().then(theme => setTheme(theme));
        return OBR.theme.onChange(theme => setTheme(theme));
    }, [obr.ready]);

    useEffect(() => {
        reloadSettings();
    }, [reloadSettings]);

    useEffect(() => {
        if (!obr.ready || !obr.sceneReady) {
            return;
        }
        getGlobalSettingsValue(GLOBAL_STORAGE_KEYS.PLAYERS_CAN_CAST_SPELLS).then(value => setPlayersCastSpells(value as boolean));
        getGlobalSettingsValue(GLOBAL_STORAGE_KEYS.SUMMONED_ENTITIES_RULE).then(value => setSummonedEntities(value as string));
    }, [obr.ready, obr.sceneReady]);

    useEffect(() => {
        if (!obr.ready || !obr.sceneReady) {
            return;
        }
        const handler = OBR.scene.grid.onChange(grid => {
            const parsedGridScale = parseGridScale(grid.scale);
            setGridScale(parsedGridScale);
        });
        OBR.scene.grid.getScale().then(scale => setGridScale(scale));

        return handler;
    }, [obr.ready, obr.sceneReady]);

    useEffect(() => {
        if (!obr.ready || !obr.sceneReady) {
            return;
        }

        return OBR.broadcast.onMessage(SETTINGS_CHANNEL, () => {
            reloadSettings();
        });
    }, [obr.ready, obr.sceneReady, reloadSettings]);

    useEffect(() => {
        if (mostRecentSize == null) {
            return;
        }
        if (isNaN(mostRecentSize) || mostRecentSize <= 0) {
            setSettingsValue(LOCAL_STORAGE_KEYS.MOST_RECENT_SPELLS_LIST_SIZE, null);
            return;
        }
        setSettingsValue(LOCAL_STORAGE_KEYS.MOST_RECENT_SPELLS_LIST_SIZE, mostRecentSize);
    }, [mostRecentSize]);

    useEffect(() => {
        if (gridScalingFactor === undefined) return;
         if (gridScalingFactor == null || isNaN(gridScalingFactor) || gridScalingFactor <= 0) {
            setSettingsValue(LOCAL_STORAGE_KEYS.GRID_SCALING_FACTOR, null);
            return;
        }
        setSettingsValue(LOCAL_STORAGE_KEYS.GRID_SCALING_FACTOR, gridScalingFactor);
    }, [gridScalingFactor]);

    useEffect(() => {
        if (keepTargets == null) {
            return;
        }
        setSettingsValue(LOCAL_STORAGE_KEYS.KEEP_SELECTED_TARGETS, keepTargets);
    }, [keepTargets]);

    useEffect(() => {
        if (defaultCaster == null) {
            return;
        }
        setSettingsValue(LOCAL_STORAGE_KEYS.DEFAULT_CASTER, defaultCaster);
    }, [defaultCaster]);

    useEffect(() => {
        if (animationRate == null) {
            return;
        }
        if (isNaN(animationRate) || animationRate <= 0) {
            setSettingsValue(LOCAL_STORAGE_KEYS.ANIMATION_UPDATE_RATE, null);
            return;
        }
        setSettingsValue(LOCAL_STORAGE_KEYS.ANIMATION_UPDATE_RATE, animationRate);
    }, [animationRate]);

    useEffect(() => {
        if (playersCastSpells == null) {
            return;
        }
        setGlobalSettingsValue(GLOBAL_STORAGE_KEYS.PLAYERS_CAN_CAST_SPELLS, playersCastSpells);
    }, [playersCastSpells]);

    useEffect(() => {
        if (summonedEntities == null) {
            return;
        }
        setGlobalSettingsValue(GLOBAL_STORAGE_KEYS.SUMMONED_ENTITIES_RULE, summonedEntities);
    }, [summonedEntities]);

    return <div ref={mainDiv}>
        <Typography
            mb={"0.5rem"}
            variant="h6"
            className="title spellbook-options"
        >
            设置
        </Typography>
        <div className="settings-menu">
            <div>
                <p className="subtitle" title="仅对当前用户生效。">本地设置</p>
                <div className="settings-item" title="若设置，将在需要时优先使用所选代替者作为部分法术的第一个目标。">
                    <label>
                        <p>默认施法者</p>
                    </label>
                    <div style={{ maxWidth: "15rem" }}>
                        <Button
                            onClick={() => setModalOpened("choose-caster-type")}
                            variant="outlined"
                            color="primary"
                        >
                            {
                                (defaultCaster == null || defaultCaster.length == 0) ?
                                    "选择" :
                                    defaultCaster.map(image => image.name).join(", ")
                            }
                        </Button>
                    </div>
                </div>
                <div className="settings-item">
                    <label htmlFor="grid-scaling-factor" title="特效缩放系数，法术宽高会乘以该值；当地图网格非 5ft 时可用于修正尺寸。">
                        <p>网格缩放系数</p>
                    </label>
                    <input
                        name="grid-scaling-factor"
                        min="0"
                        step="0.1"
                        type="number"
                        placeholder={(tryComputeGridScaling(gridScale) ?? 1).toString()}
                        className="settings-input"
                        value={gridScalingFactor ?? ""}
                        onChange={event => setGridScalingFactor(event.target.value)}
                    />
                </div>
                <div className="settings-item" title="施放后是否保留已选目标（或工具取消选中时）。">
                    <label htmlFor="recent-spells-list-size">
                        <p>保留已选目标</p>
                    </label>
                    <Checkbox checked={keepTargets ?? false} onChange={(event) => { setKeepTargets(event.currentTarget.checked) }} />
                </div>
                <div className="settings-item">
                    <label htmlFor="recent-spells-list-size" title="最近法术列表长度。">
                        <p>最近法术列表长度</p>
                    </label>
                    <input
                        name="recent-spells-list-size"
                        min="0"
                        type="number"
                        className="settings-input"
                        value={mostRecentSize ?? ""}
                        onChange={event => setMostRecentSize(event.target.value)}
                    />
                </div>
                <div className="settings-item">
                    <label htmlFor="animation-update-rate" title="动画刷新率（次/秒）。警告：设置过高可能导致设备卡顿。">
                        <p>动画刷新率</p>
                    </label>
                    <input
                        name="animation-update-rate"
                        min="0"
                        type="number"
                        className="settings-input"
                        value={animationRate ?? ""}
                        onChange={event => setAnimationRate(event.target.value)}
                    />
                </div>
            </div>
            {
                obr.player?.role === "GM" && <>
                    <hr style={{ margin: "0.5rem 0" }}></hr>
                    <div>
                        <p className="subtitle" title="以下为全局设置，仅 GM 可配置。">GM 设置</p>
                        <div className="settings-item">
                            <label htmlFor="recent-spells-list-size" title="若设为否，则仅 GM 可施法。">
                                <p>允许玩家施法</p>
                            </label>
                            <Checkbox checked={playersCastSpells ?? false} onChange={(event) => { setPlayersCastSpells(event.currentTarget.checked) }} />
                        </div>
                        <div className="settings-item" title={"召唤物的所有者：选择“施法者”则由施法玩家拥有；选择“GM”则统一归 GM。"}>
                            <label htmlFor="recent-spells-list-size">
                                <p>召唤物归属</p>
                            </label>
                            <select className="settings-select" onChange={event => setSummonedEntities(event.target.value)} value={summonedEntities ?? ""} >
                                <option value="gm-only">仅 GM</option>
                                <option value="caster">施法者</option>
                            </select>
                        </div>
                    </div>
                </>
            }
        </div>
        <Dialog
            open={modalOpened === "choose-caster-type"}
            onClose={closeModal}
            slots={{ transition: Fade }}
            slotProps={{ transition: { timeout: 300 }, paper: { sx: { backgroundColor: theme?.background?.paper } } }}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                选择默认施法者来源
            </DialogTitle>

            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    请选择一个或多个素材，或点击<strong>「使用当前选中」</strong>直接使用当前选中代币。
                </Typography>

                <Typography variant="body1">
                    <strong>已选择</strong>:{" "}
                    {defaultCaster == null || defaultCaster.length === 0
                        ? "无"
                        : defaultCaster.map((image) => image.name).join(", ")}
                </Typography>
            </DialogContent>

            <Box sx={{ alignItems: "center", padding: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Button
                    onClick={() => { handleAssetPicker(); closeModal(); }}
                    variant="outlined"
                    color="primary"
                >
                    打开素材库
                </Button>
                <Button
                    onClick={() => { handleSetCasterFromSelection(); closeModal(); }}
                    variant="outlined"
                    color="primary"
                >
                    使用当前选中
                </Button>
                <Button
                    onClick={() => { setDefaultCaster([]); closeModal(); }}
                    variant="outlined"
                    color="primary"
                >
                    清空选择
                </Button>
            </Box>
        </Dialog>
    </div>;
}
