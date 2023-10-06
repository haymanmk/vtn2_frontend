import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import { useCallback } from "react";
import * as yup from "yup";

export const StepPage1 = (props) => {
  const validationSchema = yup.object({
    employee_id: yup.string().max(255).required("This field is required"),
    production_order: yup.string().max(255).required("This field is required"),
    fixture_id: yup.string().max(255).required("This field is required"),
    process_id: yup
      .number()
      .max(9999)
      .positive("Shall be positive")
      .integer("Shall be integer")
      .required("This field is required"),
  });
  const { handleNext } = props;
  const formik = useFormik({
    initialValues: {
      employee_id: "",
      production_order: "",
      fixture_id: "",
      process_id: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 1));
      handleNext();
    },
  });

  const handleSelectMenuChange = useCallback(
    (event) => {
      // console.log(event.target);
      event.target["id"] = "process_id";
      formik.handleChange(event);
    },
    [formik]
  );

  const handleSelectMenuBlur = useCallback(
    (event) => {
      event.target["id"] = "process_id";
      formik.handleBlur(event);
    },
    [formik]
  );

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Card>
        <CardContent>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={6}>
              <TextField
                fullWidth
                required
                id="employee_id"
                name="employee_id"
                label="Employee ID"
                value={formik.values.employee_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.employee_id && Boolean(formik.errors.employee_id)}
                helperText={formik.touched.employee_id && formik.errors.employee_id}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                required
                id="production_order"
                label="Production Order No."
                value={formik.values.production_order}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.production_order && Boolean(formik.errors.production_order)}
                helperText={formik.touched.production_order && formik.errors.production_order}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                required
                id="fixture_id"
                label="Fixture ID"
                value={formik.values.fixture_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fixture_id && Boolean(formik.errors.fixture_id)}
                helperText={formik.touched.fixture_id && formik.errors.fixture_id}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                required
                select
                id="process_id"
                label="Process ID"
                value={formik.values.process_id}
                onChange={handleSelectMenuChange}
                onBlur={handleSelectMenuBlur}
                error={formik.touched.process_id && Boolean(formik.errors.process_id)}
                helperText={formik.touched.process_id && formik.errors.process_id}
              >
                <MenuItem value={10}>Test1</MenuItem>
                <MenuItem value={11}>Test2</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            <Button hidden disabled></Button>
            <Button type="submit">Next</Button>
          </Stack>
        </Box>
      </Card>
    </form>
  );
};
