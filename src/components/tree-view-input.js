import { Collapse, Divider, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";
import { ControlInput } from "./control-input";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const DEBUG = false;

function debugMessage() {
  if (DEBUG) console.log(...arguments);
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

/**
 *
 * @param {Objectj} config
 */
const initiateFlattenStruct = (config) => {
  debugMessage(config);
  if (typeof config !== "object" || Array.isArray(config))
    throw new Error("config shall be an object");

  let result = {};

  const bfs = (obj, id = "", route = []) => {
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === "object") {
        const _id = `${id}.${key}`;
        result = { ...result, [_id]: { expand: false, route: [...route, key] } };
        if (!("value" in value)) {
          bfs(value, _id, [...route, key]);
        }
      }
    });
  };

  bfs(config);
  return result;
};

const TreeViewInputComponent = memo((props) => {
  const { value, id = "", ...restProps } = props;
  const { onChange, onClick, flattenStruct, disabled } = restProps;

  debugMessage("id: ", id);

  if (!value) return;

  /**
   * @brief check if an input is an object
   * @param {Object} obj
   * @returns true: is an object; false: not an object
   */
  const isObject = (obj) => typeof obj === "object";

  return (
    <>
      {Object.entries(value).map(([key, _value]) => {
        if (isObject(_value)) {
          if (key.startsWith("@")) return; // omit special functions
          const _id = `${id}.${key}`;
          if ("value" in _value)
            return (
              <ListItem key={_id} sx={{ pl: 4 }}>
                <ControlInput
                  id={_id}
                  onChange={(_id, value) => {
                    onChange(flattenStruct[_id].route, value);
                  }}
                  disabled={disabled}
                  {..._value}
                />
              </ListItem>
            );
          else {
            return (
              <div key={_id}>
                <ListItemButton
                  onClick={() => {
                    onClick(_id);
                  }}
                >
                  <ListItemText
                    primary={"@label" in _value ? _value["@label"] : key}
                    secondary={"@comment" in _value ? _value["@comment"] : null}
                  />
                  {flattenStruct[_id].expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
                <Divider />
                <Collapse in={flattenStruct[_id].expand} unmountOnExit>
                  <List component={"div"} sx={{ pl: 4 }} disablePadding>
                    <TreeViewInputComponent value={_value} id={_id} {...restProps} />
                  </List>
                </Collapse>
              </div>
            );
          }
        }
      })}
    </>
  );
});

const batchOnOffExpand = (obj, state = false) => {
  const _obj = { ...obj };
  Object.keys(_obj).map((key) => {
    _obj[key].expand = state;
  });
  return _obj;
};

export const TreeViewInput = memo((props) => {
  const { value, expandAll, collapseAll, ...restProps } = props;
  const [flattenStruct, setFlattenStruct] = useState({});
  const [initiated, setInitiated] = useState(false);

  useEffect(() => {
    if (initiated) return;
    if (isEmptyObject(value)) return;

    const newFlattenStruct = initiateFlattenStruct(value);
    if (DEBUG) console.log("Expand", newFlattenStruct);
    setFlattenStruct(newFlattenStruct);

    setInitiated(true);
  }, [initiated, value]);

  useEffect(() => {
    if (!initiated) return;
    if (expandAll) setFlattenStruct((prev) => batchOnOffExpand(prev, true));
  }, [initiated, expandAll]);

  useEffect(() => {
    if (!initiated) return;
    if (collapseAll) setFlattenStruct((prev) => batchOnOffExpand(prev, false));
  }, [initiated, collapseAll]);

  const onClick = useCallback((id) => {
    setFlattenStruct((prev) => {
      return { ...prev, [id]: { ...prev[id], expand: !prev[id].expand } };
    });
  }, []);

  if (!initiated || isEmptyObject(value)) return;
  return (
    <TreeViewInputComponent
      value={value}
      flattenStruct={flattenStruct}
      onClick={onClick}
      {...restProps}
    />
  );
});
