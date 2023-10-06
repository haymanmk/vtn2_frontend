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

export const StepPage2 = (props) => {
  const validationSchema = yup.object({
    esn: yup.string().max(255).required("This field is required"),
  });
  const { handleNext, handleBack } = props;
  const formik = useFormik({
    initialValues: {
      esn: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 1));
      handleNext();
    },
  });

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Card>
        <CardContent>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={6}>
              <TextField
                fullWidth
                required
                id="esn"
                name="esn"
                label="ESN"
                value={formik.values.esn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.esn && Boolean(formik.errors.esn)}
                helperText={formik.touched.esn && formik.errors.esn}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            <Button onClick={handleBack}>Back</Button>
            <Button type="submit">Next</Button>
          </Stack>
        </Box>
      </Card>
    </form>
  );
};
