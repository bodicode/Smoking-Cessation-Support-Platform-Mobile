import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface TimePickerInputProps {
    value: string;
    onChange: (time: string) => void;
    label?: string;
}

const TimePickerInput: React.FC<TimePickerInputProps> = ({
    value,
    onChange,
    label,
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleChange = (_event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === "ios");
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, "0");
            const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
            onChange(`${hours}:${minutes}`);
        }
    };

    return (
        <View>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={styles.input}
                onPress={() => setShowPicker(true)}
            >
                <Text style={styles.inputText}>
                    {value ? value : "Chọn giờ"}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="default"
                    onChange={handleChange}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontWeight: "500",
        marginBottom: 6,
        fontSize: 16,
    },
    input: {
        padding: 14,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
    },
    inputText: {
        fontSize: 16,
    },
});

export default TimePickerInput;
