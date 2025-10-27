
# Add this to your DataFrame service initialization:

def _check_for_duplicates_on_load(self):
    if not self.df_properties.empty:
        duplicates = self.df_properties.duplicated(['name', 'address']).sum()
        if duplicates > 0:
            self.logger.warning(f"{duplicates} duplicates detected on load!")
            return duplicates
    return 0

# Add this to your add_property method:
def _prevent_duplicate_before_add(self, property_data):
    existing = self.df_properties[
        (self.df_properties['name'] == property_data['name']) & 
        (self.df_properties['address'] == property_data['address'])
    ]
    return not existing.empty
