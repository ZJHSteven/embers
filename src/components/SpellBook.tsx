import "./SpellBook.css";

import { APP_KEY, ASSET_LOCATION } from "../config";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fade,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    FaCaretDown,
    FaCaretUp,
    FaCirclePlus,
    FaDownload,
    FaFloppyDisk,
    FaPencil,
    FaTrash,
    FaUpload,
} from "react-icons/fa6";
import OBR, { Theme } from "@owlbear-rodeo/sdk";
import { downloadFileFromString, loadJSONFile } from "../utils";
import { getAllSpellNames, getSpell, spellIDs } from "../effects/spells";
import { setSelectedSpell, toolID } from "../effectsTool";
import { useCallback, useEffect, useRef, useState } from "react";

import { Spell } from "../types/spells";
import { useOBR } from "../react-obr/providers";

// 文件说明：法术书界面，提供分组管理、导入导出与一键施放功能，所有可见文案已本地化。
type ModalType =
    | "create-spell-group"
    | "add-spell"
    | "delete-spell-group"
    | "delete-spell"
    | "change-group-name";
export const playerMetadataSpellbookKey = `${APP_KEY}/spellbook`;

function verifyGroups(json: unknown): Record<string, string[]> | null {
    if (typeof json !== "object" || Array.isArray(json) || json == null) {
        return null;
    }
    for (const [key, value] of Object.entries(json)) {
        if (typeof key !== "string" || !Array.isArray(value)) {
            return null;
        }
        for (const arrayValue of value) {
            if (typeof arrayValue != "string") {
                return null;
            }
        }
    }
    return json as Record<string, string[]>;
}

export default function SpellBook() {
    const obr = useOBR();
    const [groups, _setGroups] = useState<Record<string, string[]>>({});
    const [modalOpened, setModalOpened] = useState<ModalType | null>(null);
    const [groupName, setGroupName] = useState<string>("");
    const [newGroupName, setNewGroupName] = useState<string>("");
    const [selectedSpellID, setSelectedSpellID] = useState<string>("");
    const [allSpellIDs, setAllSpellIDs] = useState<string[]>(spellIDs);
    const [editing, setEditing] = useState(false);
    const [isGM, setIsGM] = useState(false);
    const [theme, setTheme] = useState<Theme>();
    const mainDiv = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const setGroups = useCallback((value: Record<string, string[]> | null) => {
        if (value == null) {
            OBR.notification.show("法术书 JSON 无效", "ERROR");
            return;
        }
        localStorage.setItem(
            `${playerMetadataSpellbookKey}/${OBR.room.id}`,
            JSON.stringify(value)
        );
        _setGroups(value);
        OBR.notification.show("法术书导入成功", "SUCCESS");
    }, []);

    const closeModal = () => {
        setModalOpened(null);
    };

    const confirmGroupName = useCallback(
        (groupName: string) => {
            if (
                groupName.length == 0 ||
                Object.keys(groups).includes(groupName)
            ) {
                return;
            }
            setGroups({
                ...groups,
                [groupName]: [],
            });
            closeModal();
        },
        [groups, setGroups]
    );

    const editGroupName = useCallback(
        (groupName: string, newGroupName: string) => {
            if (
                newGroupName.length == 0 ||
                Object.keys(groups).includes(newGroupName)
            ) {
                return;
            }
            setGroups({
                ...Object.fromEntries(
                    Object.entries(groups).filter(
                        ([oldGroupName]) => oldGroupName != groupName
                    )
                ),
                [newGroupName]: groups[groupName] ?? [],
            });
            closeModal();
        },
        [groups, setGroups]
    );

    const deleteSpellGroup = useCallback(
        (groupName: string) => {
            setGroups(
                Object.fromEntries(
                    Object.entries(groups).filter(
                        ([oldGroupName]) => oldGroupName != groupName
                    )
                )
            );
            closeModal();
        },
        [groups, setGroups]
    );

    const addSpellToGroup = useCallback(
        (groupName: string, spellID: string) => {
            setGroups({
                ...groups,
                [groupName]: [...(groups[groupName] ?? []), spellID],
            });
            closeModal();
        },
        [groups, setGroups]
    );

    const deleteSpellFromGroup = useCallback(
        (groupName: string, spellID: string) => {
            setGroups({
                ...groups,
                [groupName]: [
                    ...(groups[groupName] ?? []).filter(
                        (spell) => spellID != spell
                    ),
                ],
            });
        },
        [groups, setGroups]
    );

    const moveSpellGroup = useCallback(
        (oldIndex: number, newIndex: number) => {
            const entries = Object.entries(groups);
            const newEntries = Object.entries(groups);
            newEntries.splice(oldIndex, 1, entries[newIndex]);
            newEntries.splice(newIndex, 1, entries[oldIndex]);

            setGroups(Object.fromEntries(newEntries));
        },
        [groups, setGroups]
    );

    const castSpell = useCallback((spellID: string) => {
        OBR.tool.activateTool(toolID);
        setSelectedSpell(spellID);
    }, []);

    useEffect(() => {
        if (!obr.ready) {
            return;
        }
        OBR.theme.getTheme().then(theme => setTheme(theme));
        return OBR.theme.onChange(theme => setTheme(theme));
    }, [obr.ready]);

    useEffect(() => {
        if (!obr.ready) {
            return;
        }

        const spellbookJSON = localStorage.getItem(
            `${playerMetadataSpellbookKey}/${OBR.room.id}`
        );
        const spellBook = JSON.parse(spellbookJSON ?? "{}");
        _setGroups(spellBook);
    }, [obr.ready, setGroups]);

    useEffect(() => {
        if (!obr.ready || !obr.player?.role) {
            return;
        }

        setIsGM(obr.player.role === "GM");
    }, [obr.ready, obr.player?.role]);

    useEffect(() => {
        if (!obr.ready || !obr.sceneReady) {
            return;
        }

        getAllSpellNames().then((names) => setAllSpellIDs(names));
        return OBR.scene.onMetadataChange(() => {
            getAllSpellNames().then((names) => setAllSpellIDs(names));
        });
    }, [obr.ready, obr.sceneReady]);

    return (
        <div ref={mainDiv} className="spellbook-container">
            <Box className="spellbook-header">
                <input
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept=".json"
                    type="file"
                    onChange={(event) =>
                        loadJSONFile(event, (json) =>
                            setGroups(verifyGroups(json))
                        )
                    }
                />
                <Typography
                    mb={"0.5rem"}
                    variant="h6"
                    color="text.primary"
                    className="title spellbook-options"
                >
                    <span>法术书</span>
                    {editing && <>
                        <Tooltip title="新增法术分组">
                            <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() => {
                                    setGroupName("");
                                    setModalOpened("create-spell-group");
                                }}
                            >
                                <FaCirclePlus />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="导入法术书">
                            <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FaUpload />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="下载当前法术书">
                            <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() =>
                                    downloadFileFromString(
                                        JSON.stringify(groups),
                                        "spellbook.json"
                                    )
                                }
                            >
                                <FaDownload />
                            </IconButton>
                        </Tooltip>
                    </>}
                </Typography>
                {editing && (
                    <Tooltip title="保存更改">
                        <IconButton
                            className="clickable"
                            size="small"
                            onClick={() => setEditing(false)}
                        >
                            <FaFloppyDisk />
                        </IconButton>
                    </Tooltip>
                )}
                {!editing && (
                    <Tooltip title="编辑法术书">
                        <IconButton
                            className="clickable"
                            size="small"
                            onClick={() => setEditing(true)}
                        >
                            <FaPencil />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            {Object.entries(groups).map(([groupName, spells], index) => (
                <Accordion variant="outlined" defaultExpanded key={index}>
                    <AccordionSummary
                        sx={{
                            "&.Mui-expanded": {
                                mt: "0.5rem",
                                minHeight: 0,
                            },
                            "& > .MuiAccordionSummary-content.Mui-expanded": {
                                margin: 0,
                            },
                        }}
                        className="subtitle spellbook-group"
                    >
                        <Box display="flex" alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle1" color="text.primary">
                                {groupName}
                            </Typography>

                            {editing && (
                                <>
                                    <Tooltip title="向此分组添加法术">
                                        <IconButton
                                            component="div"
                                            size="small"
                                            sx={{ ml: 1 }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setGroupName(groupName);
                                                setModalOpened("add-spell");
                                            }}
                                        >
                                            <FaCirclePlus />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="重命名此分组">
                                        <IconButton
                                            component="div"
                                            size="small"
                                            sx={{ ml: 1 }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setGroupName(groupName);
                                                setNewGroupName(groupName);
                                                setModalOpened("change-group-name");
                                            }}
                                        >
                                            <FaPencil />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="删除此分组">
                                        <IconButton
                                            component="div"
                                            size="small"
                                            sx={{ ml: 1 }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (
                                                    groups[groupName] === undefined ||
                                                    groups[groupName].length === 0
                                                ) {
                                                    deleteSpellGroup(groupName);
                                                } else {
                                                    setGroupName(groupName);
                                                    setModalOpened("delete-spell-group");
                                                }
                                            }}
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    </Tooltip>

                                    <Box className="up-down-arrows" display="flex" alignItems="center">
                                        {index !== 0 && (
                                            <Tooltip title="上移分组">
                                                <IconButton
                                                    component="div"
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        moveSpellGroup(index, index - 1);
                                                    }}
                                                >
                                                    <FaCaretUp />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {index !== Object.keys(groups).length - 1 && (
                                            <Tooltip title="下移分组">
                                                <IconButton
                                                    component="div"
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        moveSpellGroup(index, index + 1);
                                                    }}
                                                >
                                                    <FaCaretDown />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                        <ul style={{ margin: 0 }} className="spellgroup-list">
                            {spells
                                .map((spellID) => [spellID, getSpell(spellID, isGM)] as [string, Spell])
                                .filter(spell => spell[1] !== undefined)
                                .sort((a, b) =>
                                    a[1].name?.localeCompare?.(b[1].name ?? "") ?? 0
                                )
                                .map(([spellID, spell], index) => (
                                    <li
                                        key={index}
                                        className={editing ? "" : "clickable"}
                                        onClick={() => (editing ? null : castSpell(spellID))}
                                    >
                                        <div className="spellgroup-item-header">
                                            <img
                                                className="spellgroup-thumbnail"
                                                src={`${ASSET_LOCATION}/${spell.thumbnail}`}
                                            />
                                            <p>{spell.name}</p>
                                        </div>
                                        <div className="spellgroup-item-actions">
                                            {editing && (
                                                <Tooltip title="移除该法术">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                        onClick={() =>
                                                            deleteSpellFromGroup(groupName, spellID)
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </AccordionDetails>
                </Accordion>
            ))}

            {Object.keys(groups).length < 1 && (
                <Typography variant="body2" textAlign={"center"}>
                    还没有创建任何法术分组。
                    <br />
                    <span
                        className="underlined clickable"
                        onClick={() => setModalOpened("create-spell-group")}
                    >
                        点击这里创建新的法术分组。
                    </span>
                </Typography>
            )}
            <Dialog
                open={modalOpened === "create-spell-group"}
                onClose={closeModal}
                slots={{ transition: Fade }}
                slotProps={{ transition: { timeout: 300 }, paper: { sx: { backgroundColor: theme?.background?.paper } } }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    创建新法术分组
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        请为该法术分组命名：
                    </Typography>
                    <TextField
                        fullWidth
                        autoFocus
                        margin="dense"
                        variant="outlined"
                        value={groupName}
                        onChange={(event) => setGroupName(event.target.value)}
                        placeholder="分组名称"
                    />
                </DialogContent>

                <DialogActions sx={{ justifyContent: "space-between", padding: "2rem" }}>
                    <Button variant="outlined" color="inherit" onClick={closeModal}>
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => confirmGroupName(groupName)}
                    >
                        确认
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={modalOpened === "change-group-name"}
                onClose={closeModal}
                slots={{ transition: Fade }}
                slotProps={{ transition: { timeout: 300 }, paper: { sx: { backgroundColor: theme?.background?.paper } } }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    重命名法术分组
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        请为该法术分组命名：
                    </Typography>
                    <TextField
                        fullWidth
                        autoFocus
                        margin="dense"
                        variant="outlined"
                        value={newGroupName}
                        onChange={(event) => setNewGroupName(event.target.value)}
                        placeholder="分组名称"
                    />
                </DialogContent>

                <DialogActions sx={{ justifyContent: "space-between", padding: "2rem" }}>
                    <Button variant="outlined" color="inherit" onClick={closeModal}>
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => editGroupName(groupName, newGroupName)}
                    >
                        确认
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={modalOpened === "delete-spell-group"}
                onClose={closeModal}
                slots={{ transition: Fade }}
                slotProps={{ transition: { timeout: 300 }, paper: { sx: { backgroundColor: theme?.background?.paper } } }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    删除法术分组
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        确定要删除这个法术分组吗？
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ justifyContent: "space-between", padding: "2rem" }}>
                    <Button variant="outlined" color="inherit" onClick={closeModal}>
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => deleteSpellGroup(groupName)}
                    >
                        确认删除
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={modalOpened === "add-spell"}
                onClose={closeModal}
                slots={{ transition: Fade }}
                slotProps={{ transition: { timeout: 300 }, paper: { sx: { backgroundColor: theme?.background?.paper } } }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    选择要添加的法术：
                </DialogTitle>

                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="select-spell-label">
                            法术
                        </InputLabel>
                        <Select
                            labelId="select-spell-label"
                            value={selectedSpellID}
                            onChange={(event) => setSelectedSpellID(event.target.value)}
                            label="法术"
                            inputProps={{
                                MenuProps: {
                                    MenuListProps: {
                                        sx: {
                                            backgroundColor: theme?.background?.paper
                                        }
                                    }
                                }
                            }}
                        >
                            <MenuItem disabled value="" >
                                请选择法术
                            </MenuItem>
                            {allSpellIDs
                                .sort((a, b) => a.localeCompare(b))
                                .map((spellID) => {
                                    const spell = getSpell(spellID, isGM);
                                    if (!spell) return null;
                                    return (
                                        <MenuItem key={spellID} value={spellID}>
                                            {spell.name}
                                        </MenuItem>
                                    );
                                })}
                        </Select>
                    </FormControl>
                </DialogContent>

                <DialogActions sx={{ justifyContent: "space-evenly", padding: "2rem" }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            closeModal();
                            addSpellToGroup(groupName, selectedSpellID);
                        }}
                    >
                        添加
                    </Button>
                    <Button variant="outlined" onClick={closeModal}>
                        取消
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
