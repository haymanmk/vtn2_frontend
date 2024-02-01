import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ControlInput } from "./control-input";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const DEBUG = true;

const TreeViewComponents = memo((props) => {
  const { value, id = "", ...restProps } = props;
  const { onChange, onClick, expand } = restProps;

  if (DEBUG) console.log("id: ", id);
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
                    onChange(expand[_id].route, value);
                  }}
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
                  {expand[_id].expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
                <Divider />
                <Collapse in={expand[_id].expand} unmountOnExit>
                  <List component={"div"} sx={{ pl: 4 }} disablePadding>
                    <TreeViewComponents value={_value} id={_id} {...restProps} />
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

export const TreeViewInput = memo((props) => {
  const { configs, onChange, onClick, expand } = props;

  const [_configs, setConfigs] = useState([]);

  if (!configs) return;
  useEffect(() => {
    if (!Array.isArray(configs)) setConfigs([configs]);
    else setConfigs([...configs]);
    return () => {
      setConfigs([]);
    };
  }, [configs, setConfigs]);

  const readTargetKeyValue = (obj, target) => {
    let result = Object.keys(obj).filter((key) => key === target);
    if (result.length) return obj[result[0]];
  };

  const createCard = (obj, index) => {
    return (
      <Card key={index}>
        <CardHeader
          title={readTargetKeyValue(obj, "@title") || Object.keys(obj)[0]}
          subheader={readTargetKeyValue(obj, "@subtitle")}
        />
        <Divider />
        <CardContent>
          <List>
            <TreeViewComponents value={obj} onChange={onChange} onClick={onClick} expand={expand} />
          </List>
        </CardContent>
        <Divider />
        <CardActions></CardActions>
      </Card>
    );
  };

  return <>{_configs.length && Object.keys(expand).length ? _configs.map(createCard) : null}</>;
});
