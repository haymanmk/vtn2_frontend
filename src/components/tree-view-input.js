import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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

const generateID = () => {
  return Math.random().toString(16).substring(2, 8);
};

const TreeViewComponents = (props) => {
  const isObject = (obj) => typeof obj === "object";
  const { value, ...restProps } = props;
  const { onChange, onClick } = restProps;
  return (
    <>
      {Object.entries(value).map(([key, _value]) => {
        if (isObject(_value)) {
          if (key.startsWith("@")) return; // omit special functions
          if ("value" in _value)
            return (
              <ListItem key={key} sx={{ pl: 4 }}>
                <ControlInput
                  id={key}
                  onChange={(id, value) => {
                    onChange();
                  }}
                  {..._value}
                />
              </ListItem>
            );
          else {
            const id = generateID();
            const [expand, setExpand] = useState(false);

            return (
              <div key={key}>
                <ListItemButton
                  onClick={() => {
                    onClick(setExpand);
                  }}
                >
                  <ListItemText
                    primary={"@label" in _value ? _value["@label"] : key}
                    secondary={"@comment" in _value ? _value["@comment"] : null}
                  />
                  {expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
                <Divider />
                <Collapse in={expand} unmountOnExit>
                  <List component={"div"} sx={{ pl: 4 }} disablePadding>
                    <TreeViewComponents value={_value} {...restProps} />
                  </List>
                </Collapse>
              </div>
            );
          }
        }
      })}
    </>
  );
};
export const TreeViewInput = memo((props) => {
  const { configs, onChange } = props;

  const [_configs, setConfigs] = useState([]);

  useEffect(() => {
    if (!configs) return;
    if (!Array.isArray(configs)) setConfigs([configs]);
    else setConfigs([...configs]);
    return () => {
      setConfigs([]);
    };
  }, [configs, setConfigs]);

  const onClick = (setExpand) => {
    setExpand((prev) => !prev);
  };

  const readTargetKeyValue = (obj, target) => {
    let result = Object.keys(obj).filter((key) => key === target);
    if (result.length) return obj[result[0]];
  };

  return (
    <>
      {_configs.length
        ? _configs.map((obj, index) => (
            <Card key={index}>
              <CardHeader
                title={readTargetKeyValue(obj, "@title") || Object.keys(obj)[0]}
                subheader={readTargetKeyValue(obj, "@subtitle")}
              />
              <Divider />
              <CardContent>
                <List>
                  <TreeViewComponents value={obj} onChange={onChange} onClick={onClick} />
                </List>
              </CardContent>
              <Divider />
              <CardActions></CardActions>
            </Card>
          ))
        : null}
    </>
  );
});
