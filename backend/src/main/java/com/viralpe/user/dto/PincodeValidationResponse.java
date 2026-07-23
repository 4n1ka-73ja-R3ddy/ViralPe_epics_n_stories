package com.viralpe.user.dto;

public class PincodeValidationResponse {

    private String pincode;
    private String city;
    private String district;
    private String state;
    private Boolean valid;

    public PincodeValidationResponse() {
    }

    public PincodeValidationResponse(String pincode, String city, String district, String state, Boolean valid) {
        this.pincode = pincode;
        this.city = city;
        this.district = district;
        this.state = state;
        this.valid = valid;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getCity() {
// developed by anika teja reddy
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Boolean getValid() {
        return valid;
    }

    public void setValid(Boolean valid) {
        this.valid = valid;
    }
}