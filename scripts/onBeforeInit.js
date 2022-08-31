var settings = jps.settings.main;
var fields = {};
for (var i = 0, field; field = jps.settings.main.fields[i]; i++)
  fields[field.name] = field;

var regions = jelastic.env.control.GetRegions(appid, session);
if (regions.result != 0) return regions;

if (regions.array.length < 2) {
  fields["bl_count"].markup = "Cluster is not available. " + markup + "Please upgrade your account.";
  if (regions.array.length < 2)
    fields["bl_count"].markup = "Package cannot be installed on less than 2 regions. Please contact support or choose a <a href='https://jelastic.cloud/?regions=multiregion' target='_blank'>provider</a> with more regions";  
  fields["bl_count"].cls = "warning";
  fields["bl_count"].hidden = false;
  fields["bl_count"].height = 30;
  
  settings.fields.push(
    {"type": "compositefield","height": 0,"hideLabel": true,"width": 0,"items": [{"height": 0,"type": "string","required": true}]}
  );
}

return {
    result: 0,
    settings: settings
};
