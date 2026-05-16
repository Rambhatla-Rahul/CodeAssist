import json

def get_missing_keys(template, result, path=""):
    """Recursively finds keys present in template but missing in result."""
    missing = []
    if isinstance(template, dict):
        for key in template.keys():
            new_path = f"{path}.{key}" if path else key
            if key not in result:
                missing.append(new_path)
            else:
                
                if isinstance(template[key], dict):
                    missing.extend(get_missing_keys(template[key], result[key], new_path))
                
                elif isinstance(template[key], list) and len(template[key]) > 0:
                    if isinstance(template[key][0], dict):
                        
                        if not result[key] or not isinstance(result[key][0], dict):
                            missing.append(f"{new_path}[0]")
                        else:
                            missing.extend(get_missing_keys(template[key][0], result[key][0], f"{new_path}[0]"))
    return missing