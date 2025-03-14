import React, { useState, useCallback } from 'react';
import { classes, Root } from './orgListStyle';
import { Organization } from 'types';
import { Grid, Paper } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import { OrganizationForm } from 'components/OrganizationForm';
import { useAuthContext } from 'context';

export const OrganizationList: React.FC<{
  parent?: Organization;
}> = ({ parent }) => {
  const { apiPost, apiGet, setFeedbackMessage, user } = useAuthContext();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const history = useHistory();

  const onSubmit = async (body: Object) => {
    try {
      const org = await apiPost('/organizations/', {
        body
      });
      setOrganizations(organizations.concat(org));
    } catch (e: any) {
      setFeedbackMessage({
        message:
          e.status === 422
            ? 'Error when submitting organization entry.'
            : e.message ?? e.toString(),
        type: 'error'
      });
      console.error(e);
    }
  };

  const fetchOrganizations = useCallback(async () => {
    try {
      const rows = await apiGet<Organization[]>('/organizations/');
      setOrganizations(rows);
    } catch (e) {
      console.error(e);
    }
  }, [apiGet]);

  React.useEffect(() => {
    if (!parent) fetchOrganizations();
    else {
      setOrganizations(parent.children);
    }
  }, [fetchOrganizations, parent]);

  return (
    <Root>
      <Grid
        container
        spacing={2}
        style={{ margin: '0 auto', marginTop: '1rem', maxWidth: '1000px' }}
      >
        {user?.userType === 'globalAdmin' && (
          <Grid item>
            <Paper
              elevation={0}
              classes={{ root: classes.cardRoot }}
              style={{ border: '1px dashed #C9C9C9', textAlign: 'center' }}
              onClick={() => setDialogOpen(true)}
            >
              <h1>Create New {parent ? 'Team' : 'Organization'}</h1>
              <p>
                <Add></Add>
              </p>
            </Paper>
          </Grid>
        )}
        {organizations.map((org) => (
          // TODO: Add functionality to delete organizations
          <Grid item key={org.id}>
            <Paper
              elevation={0}
              classes={{ root: classes.cardRoot }}
              onClick={() => {
                history.push('/organizations/' + org.id);
              }}
            >
              <h1>{org.name}</h1>
              <p>{org.userRoles ? org.userRoles.length : 0} members</p>
              {org.tags && org.tags.length > 0 && (
                <p>Tags: {org.tags.map((tag) => tag.name).join(', ')}</p>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      <OrganizationForm
        onSubmit={onSubmit}
        open={dialogOpen}
        setOpen={setDialogOpen}
        type="create"
        parent={parent}
      ></OrganizationForm>
    </Root>
  );
};
