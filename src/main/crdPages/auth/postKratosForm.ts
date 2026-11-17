/**
 * Submits fields to a Kratos self-service action as a native form POST, the way
 * every Kratos form on the platform submits: the browser follows Kratos's own
 * redirects, so a stale session is sent to re-confirm and then back to the
 * flow, and the flow comes back carrying its outcome messages.
 */
export const postKratosForm = (action: string, fields: Record<string, string>) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  form.hidden = true;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
};
