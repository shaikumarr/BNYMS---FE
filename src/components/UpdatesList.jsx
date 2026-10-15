// src/components/UpdatesList.jsx  (full file, shows original text too)
import { List, ListItem, ListItemText, Typography } from "@mui/material";

export default function UpdatesList({ updates }) {
  if (!updates.length) {
    return <Typography color="text.secondary">No daily updates yet.</Typography>;
  }
  return (
    <List dense>
      {updates.map((u) => (
        <ListItem key={u.id} divider alignItems="flex-start">
          <ListItemText
            primary={`${u.updateDate}  ·  ${u.userName}  ·  +${u.percentAdded}%  ·  ${u.hoursSpent}h`}
            secondary={
              <>
                <Typography component="span" variant="body2" color="text.primary"
                  sx={{ display: "block", whiteSpace: "pre-wrap" }}>
                  {u.notes}
                </Typography>
                {u.rawNotes && u.rawNotes !== u.notes && (
                  <Typography component="span" variant="caption" color="text.secondary"
                    sx={{ display: "block", mt: 0.5, whiteSpace: "pre-wrap" }}>
                    Original: {u.rawNotes}
                  </Typography>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}