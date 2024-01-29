import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import { memo, useEffect, useState } from "react";
import { ControlInput } from "./control-input";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const makeComponents = (obj, onChange) => {
  return (
    <>
      {Object.entries(obj).map(([key, value]) => (
        <Accordion key={key}>
          <AccordionSummary id={key} aria-controls={key} expandIcon={<ExpandMoreIcon />}>
            {key}
          </AccordionSummary>
          {Object.prototype.hasOwnProperty.call(obj, key) ? (
            "value" in value ? (
              <AccordionDetails>
                <ControlInput id={key} onChange={onChange} {...value} />
              </AccordionDetails>
            ) : (
              makeComponents(value, onChange)
            )
          ) : null}
        </Accordion>
      ))}
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

  return (
    <>
      {_configs.length
        ? _configs.map((obj, index) => (
            <Card key={index}>
              <CardHeader title={Object.keys(obj)[0]} />
              <Divider />
              <CardContent>
                {Object.entries(obj).map(([key, value]) => (
                  <Box key={key}>{makeComponents(value, onChange)}</Box>
                ))}
              </CardContent>
            </Card>
          ))
        : null}
    </>
  );
});
