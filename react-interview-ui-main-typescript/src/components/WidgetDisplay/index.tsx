import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { Widget } from '../../lib/apiConnect';

export interface DisplayWidgetProps {
  widget: Widget;
  onDelete: (widget: Widget) => void;
  onEdit: (widget: Widget) => void;
}

const DisplayWidget = ({ widget, onDelete, onEdit }: DisplayWidgetProps): JSX.Element => {
  const { description, name, price } = widget;

  return (
    <Grid item xs={6}>
      <Card>
        <CardContent>
          <Stack spacing={2} direction="row" justifyContent="space-between">
            <Stack spacing={1}>
              <Typography component="div" gutterBottom variant="h4">
                {name}
              </Typography>
              <Typography component="div" gutterBottom variant="h5">
              ${price.toFixed(2)}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {description}
              </Typography>
            </Stack>

            {/* Edit & Delete Links */}
            <Stack spacing={1} alignItems="flex-end">
              <Link
                href="#"
                color="primary"
                onClick={() => onEdit(widget)}
                sx={{ fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Edit
              </Link>
              <Link
                href="#"
                color="error"
                onClick={() => onDelete(widget)}
                sx={{ fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Delete
              </Link>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default DisplayWidget;
